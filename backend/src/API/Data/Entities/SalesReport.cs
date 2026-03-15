using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class SalesReport
{
    [Key]
    public int ReportId { get; set; }
    public decimal TotalRevenue { get; set; }
    public int OrderCount { get; set; }

    public Report Report { get; set; } = null!;
}
