using API.Data.DbContext;
using API.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public interface IInventoryService
{
    Task DeductByBOM(int menuItemId, int quantity);
}

public class InventoryService : IInventoryService
{
    private readonly ApplicationDbContext _db;

    public InventoryService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task DeductByBOM(int menuItemId, int quantity)
    {
        if (quantity <= 0) return;

        var recipe = await _db.Recipes
            .Include(r => r.BOMs).ThenInclude(b => b.InventoryItem)
            .FirstOrDefaultAsync(r => r.MenuItemId == menuItemId);
        if (recipe?.BOMs == null || !recipe.BOMs.Any()) return;

        foreach (var entry in recipe.BOMs)
        {
            var invItem = await _db.InventoryItems.FindAsync(entry.InventoryItemId);
            if (invItem == null) continue;

            var required = entry.Quantity * quantity;
            var before = invItem.StockQty;
            invItem.StockQty -= required;

            _db.StockTransactions.Add(new StockTransaction
            {
                InventoryItemId = invItem.InventoryItemId,
                Type = "Export",
                Quantity = required,
                Reason = "KOT auto-deduct"
            });

            if (invItem.StockQty < 0)
            {
                try
                {
                    _db.OperationalAlerts.Add(new OperationalAlert
                    {
                        Type = "LowStock",
                        Status = "Active",
                        Message = $"Nguyên liệu '{invItem.Name}' tồn kho âm sau KOT auto-deduct"
                    });
                }
                catch
                {
                    // Don't block main flow
                }
            }
        }

        await _db.SaveChangesAsync();
    }
}
