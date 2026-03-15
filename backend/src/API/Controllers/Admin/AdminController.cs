using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Data.DbContext;
using API.Data.Entities;
using API.Models.DTOs;

namespace API.Controllers.Admin;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("menu")]
    public async Task<IActionResult> GetMenuItems()
    {
        var items = await _db.MenuItems
            .AsNoTracking()
            .Include(m => m.Menu)
            .OrderBy(m => m.Menu!.Name).ThenBy(m => m.SortOrder)
            .Select(m => new
            {
                m.MenuItemId,
                m.MenuId,
                MenuName = m.Menu!.Name,
                m.Name,
                m.Description,
                m.Price,
                m.ImageUrl,
                m.IsAvailable,
                m.SortOrder
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("menu")]
    public async Task<IActionResult> CreateMenuItem([FromBody] MenuItemCreateUpdateDto dto)
    {
        var item = new MenuItem
        {
            MenuId = dto.MenuId,
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            ImageUrl = dto.ImageUrl,
            IsAvailable = dto.IsAvailable,
            SortOrder = dto.SortOrder
        };
        _db.MenuItems.Add(item);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Menu item created", id = item.MenuItemId });
    }

    [HttpPut("menu/{id:int}")]
    public async Task<IActionResult> UpdateMenuItem(int id, [FromBody] MenuItemCreateUpdateDto dto)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item == null) return NotFound();
        item.MenuId = dto.MenuId;
        item.Name = dto.Name;
        item.Description = dto.Description;
        item.Price = dto.Price;
        item.ImageUrl = dto.ImageUrl;
        item.IsAvailable = dto.IsAvailable;
        item.SortOrder = dto.SortOrder;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Menu item {id} updated" });
    }

    [HttpDelete("menu/{id:int}")]
    public async Task<IActionResult> DeleteMenuItem(int id)
    {
        var item = await _db.MenuItems.FindAsync(id);
        if (item == null) return NotFound();
        _db.MenuItems.Remove(item);
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Menu item {id} deleted" });
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetMenus()
    {
        var list = await _db.Menus
            .AsNoTracking()
            .Select(m => new { m.MenuId, m.Name })
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateMenu([FromBody] MenuCreateDto dto)
    {
        var menu = new Menu { Name = dto.Name };
        _db.Menus.Add(menu);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Menu created", id = menu.MenuId });
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenueReport([FromQuery] string period = "today")
    {
        var now = DateTime.UtcNow;
        var start = period.ToLowerInvariant() switch
        {
            "today" => now.Date,
            "week" => now.AddDays(-7),
            "month" => now.AddMonths(-1),
            _ => now.Date
        };

        var paid = await _db.Invoices
            .AsNoTracking()
            .Where(i => i.Status == "Paid" && i.PaidAt >= start)
            .ToListAsync();
        var total = paid.Sum(i => i.TotalAmount);
        return Ok(new RevenueReportDto
        {
            Period = period,
            TotalRevenue = total,
            OrderCount = paid.Count
        });
    }

    [HttpGet("orders/report")]
    public async Task<IActionResult> GetOrderReport()
    {
        var orders = await _db.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .Where(o => o.Status != "Cancelled")
            .OrderByDescending(o => o.CreatedTime)
            .Take(100)
            .Select(o => new OrderReportItemDto
            {
                OrderId = o.OrderId,
                TableId = o.TableId,
                Total = o.OrderItems.Sum(oi => oi.Price * oi.Quantity),
                CreatedTime = o.CreatedTime
            })
            .ToListAsync();

        var topSellers = await _db.OrderItems
            .AsNoTracking()
            .Include(oi => oi.MenuItem)
            .GroupBy(oi => oi.MenuItem.Name)
            .Select(g => new { Name = g.Key, Total = g.Sum(oi => oi.Quantity) })
            .OrderByDescending(x => x.Total)
            .Take(10)
            .ToListAsync();

        return Ok(new OrderReportDto
        {
            Orders = orders,
            TopSellers = topSellers.Select(x => new TopSellerDto { ItemName = x.Name ?? "", QuantitySold = x.Total }).ToList()
        });
    }
}
