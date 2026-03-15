using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using API.Data.DbContext;
using API.Data.Entities;
using API.Models.DTOs;

namespace API.Controllers.Cashier;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CashierController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CashierController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("invoices")]
    public async Task<IActionResult> GetInvoices()
    {
        var list = await _db.Invoices
            .AsNoTracking()
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new InvoiceListDto
            {
                InvoiceId = i.InvoiceId,
                OrderId = i.OrderId,
                TotalAmount = i.TotalAmount,
                Status = i.Status,
                CreatedAt = i.CreatedAt
            })
            .ToListAsync();
        return Ok(list);
    }

    [HttpGet("orders-pending")]
    public async Task<IActionResult> GetOrdersPendingPayment()
    {
        var orders = await _db.Orders
            .AsNoTracking()
            .Include(o => o.Table)
            .Where(o => o.RequestPayment && o.Invoice == null && o.Status != "Cancelled")
            .OrderBy(o => o.CreatedTime)
            .Select(o => new { id = o.OrderId, OrderId = o.OrderId, o.TableId, TableName = o.Table.Name ?? $"Bàn {o.TableId}", o.CreatedTime })
            .ToListAsync();
        return Ok(orders);
    }

    [HttpPost("invoice")]
    public async Task<IActionResult> CreateInvoiceFromOrder([FromBody] CreateInvoiceRequest request)
    {
        var order = await _db.Orders.Include(o => o.OrderItems).FirstOrDefaultAsync(o => o.OrderId == request.OrderId);
        if (order == null) return NotFound(new { message = "Order not found" });
        if (order.Invoice != null) return BadRequest(new { message = "Invoice already exists for this order" });

        var totalAmount = order.OrderItems.Sum(oi => oi.Price * oi.Quantity);

        var invoice = new Invoice
        {
            OrderId = order.OrderId,
            TotalAmount = totalAmount,
            Status = "Unpaid",
            CashierId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : null
        };
        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Invoice created", invoiceId = invoice.InvoiceId });
    }

    [HttpGet("invoice/{invoiceId:int}")]
    public async Task<IActionResult> GetInvoice(int invoiceId)
    {
        var invoice = await _db.Invoices
            .AsNoTracking()
            .Include(i => i.Order).ThenInclude(o => o!.OrderItems).ThenInclude(oi => oi.MenuItem)
            .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);
        if (invoice == null) return NotFound();

        var details = invoice.Order?.OrderItems.Select(oi => new InvoiceDetailLineDto
        {
            ItemName = oi.MenuItem.Name,
            Quantity = oi.Quantity,
            UnitPrice = oi.Price,
            LineTotal = oi.Price * oi.Quantity
        }).ToList() ?? new List<InvoiceDetailLineDto>();

        var dto = new InvoiceDetailDto
        {
            InvoiceId = invoice.InvoiceId,
            OrderId = invoice.OrderId,
            TotalAmount = invoice.TotalAmount,
            Status = invoice.Status,
            CreatedAt = invoice.CreatedAt,
            Details = details
        };
        return Ok(dto);
    }

    [HttpPost("payment")]
    public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequest request)
    {
        var invoice = await _db.Invoices.FindAsync(request.InvoiceId);
        if (invoice == null) return NotFound();
        if (invoice.Status == "Paid") return BadRequest(new { message = "Invoice already paid" });

        _db.Payments.Add(new Payment
        {
            InvoiceId = invoice.InvoiceId,
            Method = request.PaymentMethod,
            Amount = invoice.TotalAmount
        });
        invoice.Status = "Paid";
        invoice.PaidAt = DateTime.UtcNow;
        invoice.CashierId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : null;

        var order = await _db.Orders.Include(o => o.Table).FirstOrDefaultAsync(o => o.OrderId == invoice.OrderId);
        if (order != null)
        {
            order.Status = "Served";
            order.Table.Status = "Available";
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "Payment processed" });
    }

    [HttpPost("invoice/{invoiceId:int}/print")]
    public IActionResult PrintInvoice(int invoiceId)
    {
        return Ok(new { message = $"Print invoice {invoiceId}" });
    }
}

public class CreateInvoiceRequest
{
    public int OrderId { get; set; }
}
