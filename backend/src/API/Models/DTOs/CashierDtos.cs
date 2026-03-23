namespace API.Models.DTOs;

public class InvoiceListDto
{
    public int InvoiceId { get; set; }
    public int OrderId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class InvoiceDetailDto
{
    public int InvoiceId { get; set; }
    public int OrderId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<InvoiceDetailLineDto> Details { get; set; } = new();
}

public class InvoiceDetailLineDto
{
    public string ItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public class PaymentRequest
{
    public int InvoiceId { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
}

// POS Session DTOs
public class SessionCurrentDto
{
    public int SessionId { get; set; }
    public DateTime OpenTime { get; set; }
    public decimal OpenCash { get; set; }
}

public class SessionOpenRequest
{
    public decimal OpenCash { get; set; }
    public int TerminalId { get; set; }
}

public class SessionCloseRequest
{
    public decimal CloseCash { get; set; }
    public string? CloseNote { get; set; }
}
