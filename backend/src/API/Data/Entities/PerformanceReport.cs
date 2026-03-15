using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class PerformanceReport
{
    [Key]
    public int ReportId { get; set; }
    public string Metrics { get; set; } = string.Empty; // JSON or key metrics

    public Report Report { get; set; } = null!;
}
