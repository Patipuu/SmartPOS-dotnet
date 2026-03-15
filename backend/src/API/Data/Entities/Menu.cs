using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class Menu
{
    [Key]
    public int MenuId { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}
