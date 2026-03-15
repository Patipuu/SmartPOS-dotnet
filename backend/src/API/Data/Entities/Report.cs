namespace API.Data.Entities;

public class Report
{
    public int ReportId { get; set; }
    public DateTime ReportDate { get; set; }

    public SalesReport? SalesReport { get; set; }
    public ProfitLossReport? ProfitLossReport { get; set; }
    public PerformanceReport? PerformanceReport { get; set; }
}
