using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class POSSession
{
    [Key]
    public int SessionId { get; set; }
    public DateTime OpenTime { get; set; }
    public DateTime? CloseTime { get; set; }
    public decimal OpenCash { get; set; }
    public decimal CashDifference { get; set; }
    public string? CloseNote { get; set; }
    public int UserId { get; set; }
    public int TerminalId { get; set; }

    public User User { get; set; } = null!;
    public Terminal Terminal { get; set; } = null!;
}
