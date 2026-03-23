using System.Security.Claims;
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

    private int? CurrentUserId => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : null;

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

    [HttpGet("tables")]
    public async Task<IActionResult> GetTables()
    {
        var list = await _db.Tables
            .AsNoTracking()
            .OrderBy(t => t.TableId)
            .Select(t => new TableListDto
            {
                TableId = t.TableId,
                Code = t.Code,
                Name = t.Name ?? $"Bàn {t.TableId}",
                Status = t.Status,
                Capacity = t.Capacity,
                Area = t.Area
            })
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("tables")]
    public async Task<IActionResult> CreateTable([FromBody] TableCreateDto dto)
    {
        var code = (dto.Code ?? "").Trim();
        if (string.IsNullOrEmpty(code)) return BadRequest(new { message = "Code bàn không được trống" });
        if (string.IsNullOrEmpty(dto.Name?.Trim())) return BadRequest(new { message = "Tên bàn không được trống" });

        var exists = await _db.Tables.AnyAsync(t => t.Code == code);
        if (exists) return Conflict(new { message = "Code bàn đã tồn tại" });

        var table = new Table
        {
            Code = code,
            Name = dto.Name.Trim(),
            Status = "Available",
            Capacity = dto.Capacity,
            Area = dto.Area?.Trim()
        };
        _db.Tables.Add(table);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Table created", tableId = table.TableId });
    }

    [HttpPut("tables/{id:int}")]
    public async Task<IActionResult> UpdateTable(int id, [FromBody] TableUpdateDto dto)
    {
        var table = await _db.Tables.FindAsync(id);
        if (table == null) return NotFound();
        if (dto.Name != null) table.Name = dto.Name.Trim();
        if (dto.Capacity.HasValue) table.Capacity = dto.Capacity;
        if (dto.Area != null) table.Area = dto.Area.Trim();
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Table {id} updated" });
    }

    [HttpDelete("tables/{id:int}")]
    public async Task<IActionResult> DeleteTable(int id)
    {
        var table = await _db.Tables.FindAsync(id);
        if (table == null) return NotFound();
        var hasActiveOrder = await _db.Orders.AnyAsync(o =>
            o.TableId == id && o.Status != "Cancelled" && o.Status != "Served");
        if (hasActiveOrder) return BadRequest(new { message = "Bàn đang phục vụ, không thể xóa" });
        _db.Tables.Remove(table);
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Table {id} deleted" });
    }

    // ─── Inventory ─────────────────────────────────────────────────────────
    [HttpGet("inventory")]
    public async Task<IActionResult> GetInventory()
    {
        var list = await _db.InventoryItems
            .AsNoTracking()
            .OrderBy(i => i.Name)
            .Select(i => new InventoryItemDto
            {
                InventoryItemId = i.InventoryItemId,
                Name = i.Name,
                StockQty = i.StockQty,
                Unit = i.Unit
            })
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("inventory")]
    public async Task<IActionResult> CreateInventoryItem([FromBody] InventoryCreateDto dto)
    {
        var item = new InventoryItem
        {
            Name = dto.Name.Trim(),
            Unit = dto.Unit?.Trim(),
            StockQty = dto.StockQty
        };
        _db.InventoryItems.Add(item);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Inventory item created", inventoryItemId = item.InventoryItemId });
    }

    [HttpPut("inventory/{id:int}")]
    public async Task<IActionResult> UpdateInventoryItem(int id, [FromBody] InventoryUpdateDto dto)
    {
        var item = await _db.InventoryItems.FindAsync(id);
        if (item == null) return NotFound();
        if (dto.Name != null) item.Name = dto.Name.Trim();
        if (dto.Unit != null) item.Unit = dto.Unit.Trim();
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Inventory item {id} updated" });
    }

    [HttpPost("inventory/import")]
    public async Task<IActionResult> ImportStock([FromBody] InventoryImportExportDto dto)
    {
        var item = await _db.InventoryItems.FindAsync(dto.InventoryItemId);
        if (item == null) return NotFound();
        if (dto.Quantity <= 0) return BadRequest(new { message = "Quantity must be positive" });

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            item.StockQty += dto.Quantity;
            _db.StockTransactions.Add(new StockTransaction
            {
                InventoryItemId = item.InventoryItemId,
                Type = "Import",
                Quantity = dto.Quantity,
                Reason = dto.Reason
            });
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return Ok(new { message = "Import successful" });
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    [HttpPost("inventory/export")]
    public async Task<IActionResult> ExportStock([FromBody] InventoryImportExportDto dto)
    {
        var item = await _db.InventoryItems.FindAsync(dto.InventoryItemId);
        if (item == null) return NotFound();
        if (dto.Quantity <= 0) return BadRequest(new { message = "Quantity must be positive" });
        if (item.StockQty - dto.Quantity < 0)
            return BadRequest(new { message = "Tồn kho không đủ" });

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            item.StockQty -= dto.Quantity;
            _db.StockTransactions.Add(new StockTransaction
            {
                InventoryItemId = item.InventoryItemId,
                Type = "Export",
                Quantity = dto.Quantity,
                Reason = dto.Reason
            });
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return Ok(new { message = "Export successful" });
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    [HttpGet("inventory/transactions")]
    public async Task<IActionResult> GetStockTransactions(
        [FromQuery] int? inventoryItemId,
        [FromQuery] string? type,
        [FromQuery] int limit = 50)
    {
        IQueryable<StockTransaction> query = _db.StockTransactions
            .AsNoTracking()
            .Include(t => t.InventoryItem);
        if (inventoryItemId.HasValue)
            query = query.Where(t => t.InventoryItemId == inventoryItemId.Value);
        if (!string.IsNullOrEmpty(type))
            query = query.Where(t => t.Type == type);
        var list = await query
            .OrderByDescending(t => t.CreatedAt)
            .Take(limit)
            .Select(t => new StockTransactionDto
            {
                TransactionId = t.TransactionId,
                InventoryItemName = t.InventoryItem.Name,
                Type = t.Type,
                Quantity = t.Quantity,
                Reason = t.Reason,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();
        return Ok(list);
    }

    // ─── BOM ───────────────────────────────────────────────────────────────
    [HttpGet("bom/{menuItemId:int}")]
    public async Task<IActionResult> GetBOM(int menuItemId)
    {
        var recipe = await _db.Recipes
            .Include(r => r.BOMs).ThenInclude(b => b.InventoryItem)
            .FirstOrDefaultAsync(r => r.MenuItemId == menuItemId);
        if (recipe?.BOMs == null) return Ok(new List<BOMEntryDto>());
        var list = recipe.BOMs.Select(b => new BOMEntryDto
        {
            InventoryItemId = b.InventoryItemId,
            InventoryItemName = b.InventoryItem.Name,
            QtyPerUnit = b.Quantity
        }).ToList();
        return Ok(list);
    }

    [HttpPut("bom/{menuItemId:int}")]
    public async Task<IActionResult> SaveBOM(int menuItemId, [FromBody] BOMSaveRequest request)
    {
        var menuItem = await _db.MenuItems.FindAsync(menuItemId);
        if (menuItem == null) return NotFound();

        await using var tx = await _db.Database.BeginTransactionAsync();
        try
        {
            var recipe = await _db.Recipes.FirstOrDefaultAsync(r => r.MenuItemId == menuItemId);
            if (recipe == null)
            {
                recipe = new Recipe { MenuItemId = menuItemId };
                _db.Recipes.Add(recipe);
                await _db.SaveChangesAsync();
            }
            var existingBoms = await _db.BOMs.Where(b => b.RecipeId == recipe.RecipeId).ToListAsync();
            _db.BOMs.RemoveRange(existingBoms);
            foreach (var e in request.Entries ?? Enumerable.Empty<BOMEntryInput>())
            {
                if (e.QtyPerUnit <= 0) continue;
                _db.BOMs.Add(new BOM
                {
                    RecipeId = recipe.RecipeId,
                    InventoryItemId = e.InventoryItemId,
                    Quantity = e.QtyPerUnit
                });
            }
            await _db.SaveChangesAsync();
            await tx.CommitAsync();
            return Ok(new { message = "BOM saved" });
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    // ─── Users & Roles ──────────────────────────────────────────────────────
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var list = await _db.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .OrderBy(u => u.Username)
            .Select(u => new UserListDto
            {
                UserId = u.UserId,
                Username = u.Username,
                DisplayName = u.DisplayName,
                RoleId = u.RoleId,
                RoleName = u.Role!.RoleName,
                IsActive = u.IsActive
            })
            .ToListAsync();
        return Ok(list);
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var list = await _db.Roles
            .AsNoTracking()
            .Select(r => new RoleDto { RoleId = r.RoleId, RoleName = r.RoleName })
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] UserCreateDto dto)
    {
        var username = (dto.Username ?? "").Trim();
        if (string.IsNullOrEmpty(username)) return BadRequest(new { message = "Username không được trống" });
        if (string.IsNullOrEmpty(dto.Password) || dto.Password.Length < 6)
            return BadRequest(new { message = "Mật khẩu tối thiểu 6 ký tự" });
        if (!await _db.Roles.AnyAsync(r => r.RoleId == dto.RoleId))
            return BadRequest(new { message = "Role không hợp lệ" });
        if (await _db.Users.AnyAsync(u => u.Username == username))
            return Conflict(new { message = "Username đã tồn tại" });

        var user = new User
        {
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 12),
            RoleId = dto.RoleId,
            DisplayName = dto.DisplayName?.Trim(),
            IsActive = true
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Ok(new { message = "User created", userId = user.UserId });
    }

    [HttpPut("users/{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto dto)
    {
        if (id == CurrentUserId) return BadRequest(new { message = "Không thể sửa chính mình" });
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        if (dto.DisplayName != null) user.DisplayName = dto.DisplayName.Trim();
        if (dto.RoleId.HasValue && await _db.Roles.AnyAsync(r => r.RoleId == dto.RoleId))
            user.RoleId = dto.RoleId.Value;
        if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"User {id} updated" });
    }

    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        if (id == CurrentUserId) return BadRequest(new { message = "Không thể vô hiệu hóa chính mình" });
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"User {id} deactivated" });
    }

    // ─── Alerts ─────────────────────────────────────────────────────────────
    [HttpGet("alerts")]
    public async Task<IActionResult> GetAlerts([FromQuery] string? status, [FromQuery] int limit = 20)
    {
        await EnsureDelayedOrderAlerts();
        IQueryable<OperationalAlert> query = _db.OperationalAlerts.AsNoTracking();
        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status == status);
        var list = await query
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .Select(a => new AlertDto
            {
                AlertId = a.AlertId,
                Type = a.Type,
                Status = a.Status,
                Message = a.Message,
                CreatedAt = a.CreatedAt,
                OrderId = a.OrderId
            })
            .ToListAsync();
        return Ok(list);
    }

    private async Task EnsureDelayedOrderAlerts()
    {
        var cutoff = DateTime.UtcNow.AddMinutes(-15);
        var delayedOrderIds = await _db.Orders
            .Where(o => o.Status != "Cancelled" && o.Status != "Served" && o.CreatedTime < cutoff)
            .Select(o => o.OrderId)
            .ToListAsync();
        var existingOrderIds = await _db.OperationalAlerts
            .Where(a => a.Type == "DelayedOrder" && a.Status == "Active" && a.OrderId != null)
            .Select(a => a.OrderId!.Value)
            .ToListAsync();
        foreach (var orderId in delayedOrderIds)
        {
            if (existingOrderIds.Contains(orderId)) continue;
            _db.OperationalAlerts.Add(new OperationalAlert
            {
                Type = "DelayedOrder",
                Status = "Active",
                Message = $"Đơn #{orderId} chờ quá 15 phút",
                OrderId = orderId
            });
        }
        await _db.SaveChangesAsync();
    }

    [HttpPut("alerts/{id:int}/resolve")]
    public async Task<IActionResult> ResolveAlert(int id)
    {
        var alert = await _db.OperationalAlerts.FindAsync(id);
        if (alert == null) return NotFound();
        alert.Status = "Resolved";
        alert.ResolvedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Alert resolved" });
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
