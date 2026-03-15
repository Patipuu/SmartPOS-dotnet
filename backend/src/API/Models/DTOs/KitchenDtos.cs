namespace API.Models.DTOs;

public class KitchenOrderDto
{
    public int OrderId { get; set; }
    public int TableId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime CreatedTime { get; set; }
    public List<KitchenOrderItemDto> Items { get; set; } = new();
}

public class KitchenOrderItemDto
{
    public int OrderItemId { get; set; }
    public string MenuItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
