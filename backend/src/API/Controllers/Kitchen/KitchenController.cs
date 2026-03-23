using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data.DbContext;
using API.Models.DTOs;
using API.Services;

namespace API.Controllers.Kitchen;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class KitchenController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IInventoryService _inventoryService;

    public KitchenController(ApplicationDbContext db, IInventoryService inventoryService)
    {
        _db = db;
        _inventoryService = inventoryService;
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders()
    {
        var orders = await _db.Orders
            .AsNoTracking()
            .Include(o => o.Table)
            .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
            .Where(o => o.Status != "Cancelled" && o.Status != "Served")
            .OrderBy(o => o.CreatedTime)
            .Select(o => new KitchenOrderDto
            {
                OrderId = o.OrderId,
                TableId = o.TableId,
                TableName = o.Table.Name ?? $"Bàn {o.TableId}",
                Status = o.Status,
                Note = o.Note,
                CreatedTime = o.CreatedTime,
                Items = o.OrderItems.Select(oi => new KitchenOrderItemDto
                {
                    OrderItemId = oi.OrderItemId,
                    MenuItemName = oi.MenuItem.Name,
                    Quantity = oi.Quantity,
                    Status = oi.Status,
                    Note = oi.Note
                }).ToList()
            })
            .ToListAsync();
        return Ok(orders);
    }

    [HttpPut("order/{orderId:int}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateStatusRequest request)
    {
        var order = await _db.Orders.FindAsync(orderId);
        if (order == null) return NotFound();
        order.Status = request.Status;
        order.UpdatedTime = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Order {orderId} status updated" });
    }

    [HttpPut("order-item/{itemId:int}/status")]
    public async Task<IActionResult> UpdateItemStatus(int itemId, [FromBody] UpdateStatusRequest request)
    {
        var item = await _db.OrderItems.FindAsync(itemId);
        if (item == null) return NotFound();
        item.Status = request.Status;
        await _db.SaveChangesAsync();

        if (request.Status == "Ready")
        {
            try
            {
                await _inventoryService.DeductByBOM(item.MenuItemId, item.Quantity);
            }
            catch
            {
                // Log but do not rollback KOT status
            }
        }
        return Ok(new { message = $"Order item {itemId} status updated" });
    }
}
