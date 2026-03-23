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

// Table DTOs
public class TableListDto
{
    public int TableId { get; set; }
    public string? Code { get; set; }
    public string? Name { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? Capacity { get; set; }
    public string? Area { get; set; }
}

public class TableCreateDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int? Capacity { get; set; }
    public string? Area { get; set; }
}

public class TableUpdateDto
{
    public string? Name { get; set; }
    public int? Capacity { get; set; }
    public string? Area { get; set; }
}

// Inventory DTOs
public class InventoryItemDto
{
    public int InventoryItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal StockQty { get; set; }
    public string? Unit { get; set; }
}

public class InventoryCreateDto
{
    public string Name { get; set; } = string.Empty;
    public string? Unit { get; set; }
    public decimal StockQty { get; set; }
}

public class InventoryUpdateDto
{
    public string? Name { get; set; }
    public string? Unit { get; set; }
}

public class InventoryImportExportDto
{
    public int InventoryItemId { get; set; }
    public decimal Quantity { get; set; }
    public string? Reason { get; set; }
}

public class StockTransactionDto
{
    public int TransactionId { get; set; }
    public string? InventoryItemName { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
}

// BOM DTOs
public class BOMEntryDto
{
    public int InventoryItemId { get; set; }
    public string? InventoryItemName { get; set; }
    public decimal QtyPerUnit { get; set; }
}

public class BOMSaveRequest
{
    public List<BOMEntryInput> Entries { get; set; } = new();
}

public class BOMEntryInput
{
    public int InventoryItemId { get; set; }
    public decimal QtyPerUnit { get; set; }
}

// User DTOs
public class UserListDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class RoleDto
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
}

public class UserCreateDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public int RoleId { get; set; }
}

public class UserUpdateDto
{
    public string? DisplayName { get; set; }
    public int? RoleId { get; set; }
    public bool? IsActive { get; set; }
}

// Alert DTOs
public class AlertDto
{
    public int AlertId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Message { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? OrderId { get; set; }
}
