using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data.DbContext;
using API.Data.Entities;
using API.Models.DTOs;
using API.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;

namespace API.Controllers.Customer;

[ApiController]
[Route("api/[controller]")]
public class CustomerController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IHubContext<OrderHub> _orderHub;

    public CustomerController(ApplicationDbContext db, IHubContext<OrderHub> orderHub)
    {
        _db = db;
        _orderHub = orderHub;
    }

    private async Task<Order?> ConsolidateActiveOrderForTable(int tableId)
    {
        var activeOrders = await _db.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.TableId == tableId && o.Status != "Cancelled" && o.Status != "Served")
            .OrderBy(o => o.CreatedTime)
            .ToListAsync();

        if (activeOrders.Count == 0) return null;

        var primaryOrder = activeOrders[0];
        if (activeOrders.Count == 1) return primaryOrder;

        foreach (var duplicate in activeOrders.Skip(1))
        {
            foreach (var duplicateItem in duplicate.OrderItems)
            {
                duplicateItem.OrderId = primaryOrder.OrderId;
                duplicateItem.Status = "Pending";
            }

            if (duplicate.RequestPayment) primaryOrder.RequestPayment = true;

            if (!string.IsNullOrWhiteSpace(duplicate.Note))
            {
                primaryOrder.Note = string.IsNullOrWhiteSpace(primaryOrder.Note)
                    ? duplicate.Note
                    : $"{primaryOrder.Note} | {duplicate.Note}";
            }

            duplicate.Status = "Cancelled";
            duplicate.RequestPayment = false;
            duplicate.UpdatedTime = DateTime.UtcNow;
        }

        primaryOrder.Status = "Pending";
        primaryOrder.UpdatedTime = DateTime.UtcNow;
        return primaryOrder;
    }

    [HttpGet("table/{code}")]
    public async Task<IActionResult> GetTableByCode(string code)
    {
        var table = await _db.Tables
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Code == code);
        if (table == null)
            return NotFound(new { message = "Table not found" });
        return Ok(new TableDto
        {
            TableId = table.TableId,
            Code = table.Code ?? code,
            Name = table.Name ?? code
        });
    }

    [HttpGet("menu")]
    public async Task<IActionResult> GetMenu()
    {
        var menus = await _db.Menus
            .AsNoTracking()
            .Select(m => new MenuDto { MenuId = m.MenuId, Name = m.Name })
            .ToListAsync();
        var items = await _db.MenuItems
            .AsNoTracking()
            .OrderBy(m => m.SortOrder)
            .Select(m => new MenuItemDto
            {
                MenuItemId = m.MenuItemId,
                MenuId = m.MenuId,
                Name = m.Name,
                Description = m.Description,
                Price = m.Price,
                ImageUrl = m.ImageUrl,
                IsAvailable = m.IsAvailable
            })
            .ToListAsync();
        return Ok(new { categories = menus, menuItems = items });
    }

    [HttpGet("menu/{menuId:int}")]
    public async Task<IActionResult> GetMenuByMenu(int menuId)
    {
        var items = await _db.MenuItems
            .AsNoTracking()
            .Where(m => m.MenuId == menuId)
            .OrderBy(m => m.SortOrder)
            .Select(m => new MenuItemDto
            {
                MenuItemId = m.MenuItemId,
                MenuId = m.MenuId,
                Name = m.Name,
                Description = m.Description,
                Price = m.Price,
                ImageUrl = m.ImageUrl,
                IsAvailable = m.IsAvailable
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("order")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        Console.WriteLine($"[B1] Nhan order request: {JsonSerializer.Serialize(request)}");

        var table = await _db.Tables.FindAsync(request.TableId);
        if (table == null)
            return BadRequest(new { message = "Table not found" });
        if (request.Items == null || request.Items.Count == 0)
            return BadRequest(new { message = "Order must have at least one item" });

        var validItems = request.Items.Where(i => i.Quantity > 0).ToList();
        if (validItems.Count == 0)
            return BadRequest(new { message = "Order must have at least one valid item" });

        var menuItemIds = validItems.Select(i => i.MenuItemId).Distinct().ToList();
        var menuItems = await _db.MenuItems
            .Where(m => menuItemIds.Contains(m.MenuItemId))
            .ToDictionaryAsync(m => m.MenuItemId);

        if (menuItems.Count == 0)
            return BadRequest(new { message = "No valid menu items found" });

        var activeOrdersForLog = await _db.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.TableId == request.TableId && o.Status != "Cancelled" && o.Status != "Served")
            .OrderBy(o => o.CreatedTime)
            .ToListAsync();
        var existingOrderForLog = activeOrdersForLog.FirstOrDefault();
        Console.WriteLine($"[B2] Order active tim thay cho ban {request.TableId}: {(existingOrderForLog?.OrderId.ToString() ?? "KHONG CO")}");
        Console.WriteLine($"[B2] So Order_Item hien tai: {(existingOrderForLog?.OrderItems?.Count ?? 0)}");

        // Một bàn chỉ có 1 order active trong phiên hiện tại (tự hợp nhất nếu dữ liệu cũ bị tách).
        var order = await ConsolidateActiveOrderForTable(request.TableId);

        if (order == null)
        {
            order = new Order
            {
                TableId = request.TableId,
                Note = request.Note,
                Status = "Pending"
            };
            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(request.Note))
            {
                order.Note = string.IsNullOrWhiteSpace(order.Note)
                    ? request.Note
                    : $"{order.Note} | {request.Note}";
            }

            // Nếu khách gọi thêm món thì đơn quay lại trạng thái xử lý và bỏ cờ yêu cầu thanh toán.
            order.Status = "Pending";
            order.RequestPayment = false;
            order.UpdatedTime = DateTime.UtcNow;
        }

        var newItemsForLog = validItems.Select(item => new
        {
            item.MenuItemId,
            item.Quantity,
            item.Note
        }).ToList();
        Console.WriteLine($"[B3] Chuan bi luu. Order_Items se luu: {JsonSerializer.Serialize(newItemsForLog)}");

        foreach (var item in validItems)
        {
            if (!menuItems.TryGetValue(item.MenuItemId, out var menuItem)) continue;
            _db.OrderItems.Add(new OrderItem
            {
                OrderId = order.OrderId,
                MenuItemId = menuItem.MenuItemId,
                Quantity = item.Quantity,
                Price = menuItem.Price,
                Note = item.Note,
                Status = "Pending"
            });
        }
        await _db.SaveChangesAsync();
        var savedCount = await _db.OrderItems.CountAsync(oi => oi.OrderId == order.OrderId);
        Console.WriteLine($"[B4] Da luu. Order_Items trong DB: {savedCount}");

        table.Status = "Occupied";
        await _db.SaveChangesAsync();

        var orderForHub = new KitchenOrderDto
        {
            OrderId = order.OrderId,
            TableId = order.TableId,
            TableName = table.Name ?? $"Bàn {order.TableId}",
            Status = order.Status,
            Note = order.Note,
            CreatedTime = order.CreatedTime,
            Items = (await _db.OrderItems.AsNoTracking()
                .Where(oi => oi.OrderId == order.OrderId)
                .Include(oi => oi.MenuItem)
                .Select(oi => new KitchenOrderItemDto
                {
                    OrderItemId = oi.OrderItemId,
                    MenuItemName = oi.MenuItem.Name,
                    Quantity = oi.Quantity,
                    Status = oi.Status,
                    Note = oi.Note
                }).ToListAsync())
        };
        await _orderHub.Clients.Group("kitchen").SendAsync("NewOrder", orderForHub);

        return Ok(new { message = "Order created", orderId = order.OrderId });
    }

    [HttpGet("order/status")]
    public async Task<IActionResult> GetOrderStatus([FromQuery] int tableId)
    {
        // Đảm bảo trạng thái luôn chỉ còn một đơn active duy nhất cho mỗi bàn.
        await ConsolidateActiveOrderForTable(tableId);
        await _db.SaveChangesAsync();

        var order = await _db.Orders
            .AsNoTracking()
            .Where(o => o.TableId == tableId && o.Status != "Cancelled" && o.Status != "Served")
            .OrderByDescending(o => o.CreatedTime)
            .FirstOrDefaultAsync();

        if (order == null) return Ok((OrderStatusDto?)null);

        var items = await _db.OrderItems
            .AsNoTracking()
            .Where(oi => oi.OrderId == order.OrderId)
            .Include(oi => oi.MenuItem)
            .Select(oi => new OrderItemStatusDto
            {
                OrderItemId = oi.OrderItemId,
                MenuItemName = oi.MenuItem.Name,
                Quantity = oi.Quantity,
                Status = oi.Status
            })
            .ToListAsync();

        return Ok(new OrderStatusDto
        {
            OrderId = order.OrderId,
            TableId = order.TableId,
            Status = order.Status,
            RequestPayment = order.RequestPayment,
            Items = items
        });
    }

    [HttpPost("order/{orderId:int}/request-payment")]
    public async Task<IActionResult> RequestPayment(int orderId)
    {
        var order = await _db.Orders.FindAsync(orderId);
        if (order == null) return NotFound();

        var primaryOrder = await ConsolidateActiveOrderForTable(order.TableId);
        if (primaryOrder == null) return NotFound();

        primaryOrder.RequestPayment = true;
        primaryOrder.UpdatedTime = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Payment requested" });
    }
}
