namespace API.Models.DTOs;

public class TableDto
{
    public int TableId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class MenuDto
{
    public int MenuId { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class MenuItemDto
{
    public int MenuItemId { get; set; }
    public int MenuId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; }
}

public class CreateOrderRequest
{
    public int TableId { get; set; }
    public string? Note { get; set; }
    public List<OrderItemRequest> Items { get; set; } = new();
}

public class OrderItemRequest
{
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
    public string? Note { get; set; }
}

public class OrderStatusDto
{
    public int OrderId { get; set; }
    public int TableId { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool RequestPayment { get; set; }
    public List<OrderItemStatusDto> Items { get; set; } = new();
}

public class TableOrdersStatusDto
{
    public int TableId { get; set; }
    public List<OrderStatusDto> Orders { get; set; } = new();
}

public class OrderItemStatusDto
{
    public int OrderId { get; set; }
    public int OrderItemId { get; set; }
    public string MenuItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Status { get; set; } = string.Empty;
}
