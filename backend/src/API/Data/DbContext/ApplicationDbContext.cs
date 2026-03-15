using Microsoft.EntityFrameworkCore;
using API.Data.Entities;

namespace API.Data.DbContext;

public class ApplicationDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Role> Roles { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Terminal> Terminals { get; set; }
    public DbSet<POSSession> POSSessions { get; set; }
    public DbSet<Table> Tables { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<Menu> Menus { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Kitchen> Kitchens { get; set; }
    public DbSet<KitchenStation> KitchenStations { get; set; }
    public DbSet<KOT> KOTs { get; set; }
    public DbSet<Recipe> Recipes { get; set; }
    public DbSet<InventoryItem> InventoryItems { get; set; }
    public DbSet<BOM> BOMs { get; set; }
    public DbSet<StockTransaction> StockTransactions { get; set; }
    public DbSet<Checklist> Checklists { get; set; }
    public DbSet<OperationalAlert> OperationalAlerts { get; set; }
    public DbSet<Report> Reports { get; set; }
    public DbSet<SalesReport> SalesReports { get; set; }
    public DbSet<ProfitLossReport> ProfitLossReports { get; set; }
    public DbSet<PerformanceReport> PerformanceReports { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Role -> User 1-N
        modelBuilder.Entity<User>(e =>
        {
            e.HasOne(u => u.Role)
             .WithMany(r => r.Users)
             .HasForeignKey(u => u.RoleId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // User 1-N POSSession, Terminal 1-N POSSession
        modelBuilder.Entity<POSSession>(e =>
        {
            e.HasOne(s => s.User)
             .WithMany(u => u.POSSessions)
             .HasForeignKey(s => s.UserId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(s => s.Terminal)
             .WithMany(t => t.POSSessions)
             .HasForeignKey(s => s.TerminalId)
             .OnDelete(DeleteBehavior.Restrict);
            e.Property(s => s.CashDifference).HasPrecision(18, 2);
        });

        // Table 1-N Order, User 1-N Order
        modelBuilder.Entity<Table>(e =>
        {
            e.HasIndex(t => t.Code).IsUnique().HasFilter("[Code] IS NOT NULL");
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.HasOne(o => o.Table)
             .WithMany(t => t.Orders)
             .HasForeignKey(o => o.TableId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(o => o.User)
             .WithMany(u => u.Orders)
             .HasForeignKey(o => o.UserId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(o => o.Invoice)
             .WithOne(i => i.Order)
             .HasForeignKey<Invoice>(i => i.OrderId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Menu 1-N MenuItem
        modelBuilder.Entity<MenuItem>(e =>
        {
            e.HasOne(m => m.Menu)
             .WithMany(menu => menu.MenuItems)
             .HasForeignKey(m => m.MenuId)
             .OnDelete(DeleteBehavior.Restrict);
            e.Property(m => m.Price).HasPrecision(18, 2);
        });

        // Order 1-N OrderItem, MenuItem 1-N OrderItem
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.HasOne(oi => oi.Order)
             .WithMany(o => o.OrderItems)
             .HasForeignKey(oi => oi.OrderId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(oi => oi.MenuItem)
             .WithMany(m => m.OrderItems)
             .HasForeignKey(oi => oi.MenuItemId)
             .OnDelete(DeleteBehavior.Restrict);
            e.Property(oi => oi.Price).HasPrecision(18, 2);
        });

        // Order 1-1 Invoice, User 1-N Invoice (Cashier)
        modelBuilder.Entity<Invoice>(e =>
        {
            e.HasOne(i => i.Cashier)
             .WithMany(u => u.Invoices)
             .HasForeignKey(i => i.CashierId)
             .OnDelete(DeleteBehavior.SetNull);
            e.Property(i => i.TotalAmount).HasPrecision(18, 2);
        });

        // Invoice 1-N Payment
        modelBuilder.Entity<Payment>(e =>
        {
            e.HasOne(p => p.Invoice)
             .WithMany(i => i.Payments)
             .HasForeignKey(p => p.InvoiceId)
             .OnDelete(DeleteBehavior.Cascade);
            e.Property(p => p.Amount).HasPrecision(18, 2);
        });

        // Kitchen 1-N KitchenStation
        modelBuilder.Entity<KitchenStation>(e =>
        {
            e.HasOne(s => s.Kitchen)
             .WithMany(k => k.KitchenStations)
             .HasForeignKey(s => s.KitchenId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Order 1-N KOT, KitchenStation 1-N KOT
        modelBuilder.Entity<KOT>(e =>
        {
            e.HasOne(k => k.Order)
             .WithMany(o => o.KOTs)
             .HasForeignKey(k => k.OrderId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(k => k.KitchenStation)
             .WithMany(s => s.KOTs)
             .HasForeignKey(k => k.StationId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // MenuItem 1-1 Recipe
        modelBuilder.Entity<Recipe>(e =>
        {
            e.HasOne(r => r.MenuItem)
             .WithOne(m => m.Recipe)
             .HasForeignKey<Recipe>(r => r.MenuItemId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Recipe 1-N BOM, InventoryItem 1-N BOM
        modelBuilder.Entity<BOM>(e =>
        {
            e.HasOne(b => b.Recipe)
             .WithMany(r => r.BOMs)
             .HasForeignKey(b => b.RecipeId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(b => b.InventoryItem)
             .WithMany(i => i.BOMs)
             .HasForeignKey(b => b.InventoryItemId)
             .OnDelete(DeleteBehavior.Restrict);
            e.Property(b => b.Quantity).HasPrecision(18, 4);
        });

        modelBuilder.Entity<InventoryItem>(e =>
        {
            e.Property(i => i.StockQty).HasPrecision(18, 4);
        });

        modelBuilder.Entity<StockTransaction>(e =>
        {
            e.HasOne(t => t.InventoryItem)
             .WithMany(i => i.StockTransactions)
             .HasForeignKey(t => t.InventoryItemId)
             .OnDelete(DeleteBehavior.Restrict);
            e.Property(t => t.Quantity).HasPrecision(18, 4);
        });

        // Checklist 1-N OperationalAlert, Order 1-N OperationalAlert
        modelBuilder.Entity<OperationalAlert>(e =>
        {
            e.HasOne(a => a.Order)
             .WithMany(o => o.OperationalAlerts)
             .HasForeignKey(a => a.OrderId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(a => a.Checklist)
             .WithMany(c => c.OperationalAlerts)
             .HasForeignKey(a => a.ChecklistId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // Report 1-1 SalesReport, ProfitLossReport, PerformanceReport (TPT/TPH - we use separate tables with FK)
        modelBuilder.Entity<SalesReport>(e =>
        {
            e.HasKey(s => s.ReportId);
            e.HasOne(s => s.Report)
             .WithOne(r => r.SalesReport)
             .HasForeignKey<SalesReport>(s => s.ReportId)
             .OnDelete(DeleteBehavior.Cascade);
            e.Property(s => s.TotalRevenue).HasPrecision(18, 2);
        });

        modelBuilder.Entity<ProfitLossReport>(e =>
        {
            e.HasKey(p => p.ReportId);
            e.HasOne(p => p.Report)
             .WithOne(r => r.ProfitLossReport)
             .HasForeignKey<ProfitLossReport>(p => p.ReportId)
             .OnDelete(DeleteBehavior.Cascade);
            e.Property(p => p.Revenue).HasPrecision(18, 2);
            e.Property(p => p.Cost).HasPrecision(18, 2);
            e.Property(p => p.Profit).HasPrecision(18, 2);
        });

        modelBuilder.Entity<PerformanceReport>(e =>
        {
            e.HasKey(p => p.ReportId);
            e.HasOne(p => p.Report)
             .WithOne(r => r.PerformanceReport)
             .HasForeignKey<PerformanceReport>(p => p.ReportId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
