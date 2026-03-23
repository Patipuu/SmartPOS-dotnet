using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using API.Data.DbContext;
using API.Data.Entities;
using API.Hubs;
using API.Models.DTOs;

namespace API.Controllers.Cashier;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CashierController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IHubContext<OrderHub> _orderHub;

    public CashierController(ApplicationDbContext db, IHubContext<OrderHub> orderHub)
    {
        _db = db;
        _orderHub = orderHub;
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
            // PRD acceptance: sau khi thanh toán, bàn về 'Trống' và KDS không còn hiển thị KOT.
            // Backend hiện tại đánh dấu Served theo invoice.OrderId. Nếu có nhiều Order active cùng bàn,
            // Kitchen vẫn còn hiển thị các Order khác vì filter theo Order.Status != 'Served'.
            // Vì vậy, khi thanh toán một invoice cho bàn này, đánh dấu Served cho toàn bộ Orders của TableId.
            var tableId = order.TableId;

            var tableOrders = await _db.Orders
                .Where(o => o.TableId == tableId && o.Status != "Cancelled")
                .ToListAsync();

            foreach (var o in tableOrders)
            {
                o.Status = "Served";
            }

            order.Table.Status = "Available";

            // Realtime: clear customer order status, notify cashier to refresh
            var tableIdStr = order.TableId.ToString();
            await _orderHub.Clients.Group($"table-{tableIdStr}").SendAsync("OrderUpdated", (object?)null);
            await _orderHub.Clients.Group("cashier").SendAsync("PaymentProcessed", new { tableId = order.TableId });
        }
        await _db.SaveChangesAsync();
        return Ok(new { message = "Payment processed" });
    }

    [HttpPost("invoice/{invoiceId:int}/print")]
    public IActionResult PrintInvoice(int invoiceId)
    {
        return Ok(new { message = $"Print invoice {invoiceId}" });
    }

    [HttpGet("terminals")]
    public async Task<IActionResult> GetTerminals()
    {
        var list = await _db.Terminals
            .AsNoTracking()
            .Select(t => new { t.TerminalId, t.Location })
            .ToListAsync();
        return Ok(list);
    }

    // ─── POS Session ─────────────────────────────────────────────────────────
    [HttpGet("session/current")]
    public async Task<IActionResult> GetCurrentSession()
    {
        var userId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : 0;
        var session = await _db.POSSessions
            .AsNoTracking()
            .Where(s => s.UserId == userId && s.CloseTime == null)
            .OrderByDescending(s => s.OpenTime)
            .FirstOrDefaultAsync();
        if (session == null) return Ok((object?)null);
        return Ok(new SessionCurrentDto
        {
            SessionId = session.SessionId,
            OpenTime = session.OpenTime,
            OpenCash = session.OpenCash
        });
    }

    [HttpPost("session/open")]
    public async Task<IActionResult> OpenSession([FromBody] SessionOpenRequest request)
    {
        var userId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : 0;
        var existing = await _db.POSSessions.AnyAsync(s => s.UserId == userId && s.CloseTime == null);
        if (existing) return Conflict(new { message = "Đã có ca đang mở" });

        var terminal = await _db.Terminals.FindAsync(request.TerminalId);
        if (terminal == null) return BadRequest(new { message = "Terminal not found" });

        var session = new POSSession
        {
            UserId = userId,
            TerminalId = request.TerminalId,
            OpenTime = DateTime.UtcNow,
            OpenCash = request.OpenCash,
            CashDifference = 0
        };
        _db.POSSessions.Add(session);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Session opened", sessionId = session.SessionId });
    }

    [HttpPost("session/close")]
    public async Task<IActionResult> CloseSession([FromBody] SessionCloseRequest request)
    {
        var userId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : 0;
        var session = await _db.POSSessions
            .FirstOrDefaultAsync(s => s.UserId == userId && s.CloseTime == null);
        if (session == null) return BadRequest(new { message = "Không có ca đang mở" });

        var diff = request.CloseCash - session.OpenCash;
        if (diff != 0 && string.IsNullOrWhiteSpace(request.CloseNote))
            return BadRequest(new { message = "Chênh lệch != 0 → bắt buộc nhập ghi chú lý do" });

        session.CloseTime = DateTime.UtcNow;
        session.CashDifference = diff;
        session.CloseNote = request.CloseNote;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Session closed", cashDifference = diff });
    }

    [HttpGet("tables")]
    public async Task<IActionResult> GetTables()
    {
        var tables = await _db.Tables
            .AsNoTracking()
            .OrderBy(t => t.TableId)
            .Select(t => new { t.TableId, t.Code, TableName = t.Name ?? $"Bàn {t.TableId}", t.Status, t.Capacity, t.Area })
            .ToListAsync();

        var kitchenOrders = await _db.Orders
            .Where(o => o.Status != "Cancelled" && o.Status != "Served")
            .Select(o => o.TableId)
            .Distinct()
            .ToListAsync();
        var pendingTableIds = await _db.Orders
            .Where(o => o.RequestPayment && o.Invoice == null && o.Status != "Cancelled")
            .Select(o => o.TableId)
            .Distinct()
            .ToListAsync();

        var activeServing = new HashSet<int>(kitchenOrders);
        var activePayment = new HashSet<int>(pendingTableIds);

        var result = tables.Select(t => new
        {
            t.TableId,
            t.Code,
            tableName = t.TableName,
            status = activePayment.Contains(t.TableId) ? "PAYMENT_PENDING" : activeServing.Contains(t.TableId) ? "SERVING" : (t.Status == "Occupied" ? "SERVING" : "AVAILABLE"),
            t.Capacity,
            t.Area
        }).ToList();
        return Ok(result);
    }
}

public class CreateInvoiceRequest
{
    public int OrderId { get; set; }
}
