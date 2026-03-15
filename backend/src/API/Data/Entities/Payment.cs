using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class Payment
{
    [Key]
    public int PaymentId { get; set; }
    public int InvoiceId { get; set; }
    public string Method { get; set; } = "Cash"; // Cash, Card, etc.
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Invoice Invoice { get; set; } = null!;
}
