using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class Recipe
{
    [Key]
    public int RecipeId { get; set; }
    public int MenuItemId { get; set; }

    public MenuItem MenuItem { get; set; } = null!;
    public ICollection<BOM> BOMs { get; set; } = new List<BOM>();
}
