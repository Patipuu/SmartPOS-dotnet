using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class Kitchen
{
    [Key]
    public int KitchenId { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<KitchenStation> KitchenStations { get; set; } = new List<KitchenStation>();
}
