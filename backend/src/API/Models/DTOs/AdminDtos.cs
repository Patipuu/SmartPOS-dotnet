namespace API.Models.DTOs;

public class MenuItemCreateUpdateDto
{
    public int MenuId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; } = true;
    public int SortOrder { get; set; }
}

public class MenuCreateDto
{
    public string Name { get; set; } = string.Empty;
}

public class RevenueReportDto
{
    public string Period { get; set; } = string.Empty;
    public decimal TotalRevenue { get; set; }
    public int OrderCount { get; set; }
}

public class OrderReportDto
{
    public List<OrderReportItemDto> Orders { get; set; } = new();
    public List<TopSellerDto> TopSellers { get; set; } = new();
}

public class OrderReportItemDto
{
    public int OrderId { get; set; }
    public int TableId { get; set; }
    public decimal Total { get; set; }
    public DateTime CreatedTime { get; set; }
}

public class TopSellerDto
{
    public string ItemName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
}
