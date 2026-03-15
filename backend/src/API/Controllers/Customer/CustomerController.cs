using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data.DbContext;
using API.Data.Entities;
using API.Models.DTOs;
using API.Hubs;
using Microsoft.AspNetCore.SignalR;

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
            .Where(m => m.IsAvailable)
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
            .Where(m => m.MenuId == menuId && m.IsAvailable)
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
        var table = await _db.Tables.FindAsync(request.TableId);
        if (table == null)
            return BadRequest(new { message = "Table not found" });
        if (request.Items == null || request.Items.Count == 0)
            return BadRequest(new { message = "Order must have at least one item" });

        var order = new Order
        {
            TableId = request.TableId,
            Note = request.Note,
            Status = "Pending"
        };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        foreach (var item in request.Items)
        {
            var menuItem = await _db.MenuItems.FindAsync(item.MenuItemId);
            if (menuItem == null) continue;
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
        var order = await _db.Orders
            .AsNoTracking()
            .Where(o => o.TableId == tableId && o.Status != "Cancelled")
            .OrderByDescending(o => o.CreatedTime)
            .FirstOrDefaultAsync();
        if (order == null)
            return Ok((OrderStatusDto?)null);

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
        order.RequestPayment = true;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Payment requested" });
    }
}
