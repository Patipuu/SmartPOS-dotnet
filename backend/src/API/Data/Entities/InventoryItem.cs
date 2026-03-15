using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class InventoryItem
{
    [Key]
    public int InventoryItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal StockQty { get; set; }
    public string? Unit { get; set; }

    public ICollection<BOM> BOMs { get; set; } = new List<BOM>();
    public ICollection<StockTransaction> StockTransactions { get; set; } = new List<StockTransaction>();
}
