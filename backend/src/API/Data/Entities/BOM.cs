using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class BOM
{
    [Key]
    public int BomId { get; set; }
    public int RecipeId { get; set; }
    public int InventoryItemId { get; set; }
    public decimal Quantity { get; set; }

    public Recipe Recipe { get; set; } = null!;
    public InventoryItem InventoryItem { get; set; } = null!;
}
