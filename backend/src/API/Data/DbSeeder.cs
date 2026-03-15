using API.Data.Entities;
using API.Data.DbContext;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        await db.Database.MigrateAsync();

        if (await db.Users.AnyAsync())
            return;

        db.Roles.AddRange(
            new Role { RoleName = "Admin" },
            new Role { RoleName = "Cashier" },
            new Role { RoleName = "Kitchen" },
            new Role { RoleName = "Staff" }
        );
        await db.SaveChangesAsync();

        var adminRole = await db.Roles.FirstAsync(r => r.RoleName == "Admin");
        db.Users.Add(new User
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            RoleId = adminRole.RoleId,
            DisplayName = "Administrator"
        });
        await db.SaveChangesAsync();

        db.Menus.AddRange(
            new Menu { Name = "Món chính" },
            new Menu { Name = "Đồ uống" },
            new Menu { Name = "Tráng miệng" }
        );
        await db.SaveChangesAsync();

        var menu1 = await db.Menus.FirstAsync(m => m.Name == "Món chính");
        var menu2 = await db.Menus.FirstAsync(m => m.Name == "Đồ uống");
        db.MenuItems.AddRange(
            new MenuItem { MenuId = menu1.MenuId, Name = "Phở Bò", Price = 50000, SortOrder = 1 },
            new MenuItem { MenuId = menu1.MenuId, Name = "Bún Bò", Price = 45000, SortOrder = 2 },
            new MenuItem { MenuId = menu2.MenuId, Name = "Coca Cola", Price = 15000, SortOrder = 1 },
            new MenuItem { MenuId = menu2.MenuId, Name = "Nước cam", Price = 20000, SortOrder = 2 }
        );

        db.Tables.AddRange(
            new Table { Code = "T01", Name = "Bàn 1", Status = "Available" },
            new Table { Code = "T02", Name = "Bàn 2", Status = "Available" },
            new Table { Code = "T03", Name = "Bàn 3", Status = "Available" }
        );

        db.Terminals.Add(new Terminal { Location = "Quầy 1" });

        await db.SaveChangesAsync();
    }
}
