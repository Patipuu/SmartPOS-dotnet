using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class KOT
{
    [Key]
    public int KotId { get; set; }
    public int OrderId { get; set; }
    public int StationId { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Preparing, Ready
    public DateTime CreatedTime { get; set; } = DateTime.UtcNow;

    public Order Order { get; set; } = null!;
    public KitchenStation KitchenStation { get; set; } = null!;
}
