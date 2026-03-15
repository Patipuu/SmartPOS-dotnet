using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class StockTransaction
{
    [Key]
    public int TransactionId { get; set; }
    public int InventoryItemId { get; set; }
    public string Type { get; set; } = string.Empty; // In, Out, Adjust
    public decimal Quantity { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public InventoryItem InventoryItem { get; set; } = null!;
}
