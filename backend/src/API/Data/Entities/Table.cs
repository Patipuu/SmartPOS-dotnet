using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class Table
{
    [Key]
    public int TableId { get; set; }
    public string Status { get; set; } = "Available"; // Available, Occupied, Reserved
    public string? Code { get; set; } // QR code value for customer flow
    public string? Name { get; set; }
    public int? Capacity { get; set; }
    public string? Area { get; set; }

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
