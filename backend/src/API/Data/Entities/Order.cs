using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class Order
{
    [Key]
    public int OrderId { get; set; }
    public string OrderType { get; set; } = "DineIn"; // DineIn, TakeAway, Delivery
    public string Status { get; set; } = "Pending"; // Pending, Preparing, Ready, Served, Cancelled
    public DateTime CreatedTime { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedTime { get; set; }
    public bool RequestPayment { get; set; }
    public string? Note { get; set; }
    public int TableId { get; set; }
    public int? UserId { get; set; }

    public Table Table { get; set; } = null!;
    public User? User { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public Invoice? Invoice { get; set; }
    public ICollection<KOT> KOTs { get; set; } = new List<KOT>();
    public ICollection<OperationalAlert> OperationalAlerts { get; set; } = new List<OperationalAlert>();
}
