using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class OrderItem
{
    [Key]
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Preparing, Ready
    public string? Note { get; set; }

    public Order Order { get; set; } = null!;
    public MenuItem MenuItem { get; set; } = null!;
}
