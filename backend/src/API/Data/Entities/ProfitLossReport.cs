using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class ProfitLossReport
{
    [Key]
    public int ReportId { get; set; }
    public decimal Revenue { get; set; }
    public decimal Cost { get; set; }
    public decimal Profit { get; set; }

    public Report Report { get; set; } = null!;
}
