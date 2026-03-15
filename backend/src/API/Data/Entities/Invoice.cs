using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class Invoice
{
    [Key]
    public int InvoiceId { get; set; }
    public int OrderId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Unpaid"; // Unpaid, Paid
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public int? CashierId { get; set; }

    public Order Order { get; set; } = null!;
    public User? Cashier { get; set; }
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
