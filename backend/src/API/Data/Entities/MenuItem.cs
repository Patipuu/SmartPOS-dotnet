using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class MenuItem
{
    [Key]
    public int MenuItemId { get; set; }
    public int MenuId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; } = true;
    public int SortOrder { get; set; }

    public Menu Menu { get; set; } = null!;
    public Recipe? Recipe { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
