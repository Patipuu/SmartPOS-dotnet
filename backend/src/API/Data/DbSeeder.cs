using API.Data.Entities;
using API.Data.DbContext;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        await db.Database.MigrateAsync();

        // Ensure roles exist
        if (!await db.Roles.AnyAsync())
        {
            db.Roles.AddRange(
                new Role { RoleName = "Admin" },
                new Role { RoleName = "Cashier" },
                new Role { RoleName = "Kitchen" },
                new Role { RoleName = "Staff" }
            );
            await db.SaveChangesAsync();
        }

        var adminRole = await db.Roles.FirstAsync(r => r.RoleName == "Admin");
        var cashierRole = await db.Roles.FirstAsync(r => r.RoleName == "Cashier");
        var kitchenRole = await db.Roles.FirstAsync(r => r.RoleName == "Kitchen");

        // Seed demo users (do not early-return if users already exist)
        if (!await db.Users.AnyAsync(u => u.Username == "admin"))
        {
            db.Users.Add(new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                RoleId = adminRole.RoleId,
                DisplayName = "Administrator"
            });
        }

        if (!await db.Users.AnyAsync(u => u.Username == "cashier"))
        {
            db.Users.Add(new User
            {
                Username = "cashier",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("cashier123"),
                RoleId = cashierRole.RoleId,
                DisplayName = "Cashier"
            });
        }

        if (!await db.Users.AnyAsync(u => u.Username == "kitchen"))
        {
            db.Users.Add(new User
            {
                Username = "kitchen",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("kitchen123"),
                RoleId = kitchenRole.RoleId,
                DisplayName = "Kitchen"
            });
        }

        // Seed menus/items/tables if empty
        if (!await db.Menus.AnyAsync())
        {
            db.Menus.AddRange(
                new Menu { Name = "Món chính" },
                new Menu { Name = "Đồ uống" },
                new Menu { Name = "Tráng miệng" }
            );
            await db.SaveChangesAsync();
        }

        if (!await db.MenuItems.AnyAsync())
        {
            var menu1 = await db.Menus.FirstAsync(m => m.Name == "Món chính");
            var menu2 = await db.Menus.FirstAsync(m => m.Name == "Đồ uống");
            db.MenuItems.AddRange(
                new MenuItem { MenuId = menu1.MenuId, Name = "Phở Bò", Price = 50000, SortOrder = 1 },
                new MenuItem { MenuId = menu1.MenuId, Name = "Bún Bò", Price = 45000, SortOrder = 2 },
                new MenuItem { MenuId = menu2.MenuId, Name = "Coca Cola", Price = 15000, SortOrder = 1 },
                new MenuItem { MenuId = menu2.MenuId, Name = "Nước cam", Price = 20000, SortOrder = 2 }
            );
        }

        if (!await db.Tables.AnyAsync())
        {
            db.Tables.AddRange(
                new Table { Code = "T01", Name = "Bàn 1", Status = "Available" },
                new Table { Code = "T02", Name = "Bàn 2", Status = "Available" },
                new Table { Code = "T03", Name = "Bàn 3", Status = "Available" }
            );
        }

        if (!await db.Terminals.AnyAsync())
        {
            db.Terminals.Add(new Terminal { Location = "Quầy 1" });
        }

        await db.SaveChangesAsync();
    }
}
