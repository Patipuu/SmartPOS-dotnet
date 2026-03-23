using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class Phase1_AddFields_POSSession_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Area",
                table: "Tables",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Capacity",
                table: "Tables",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CloseNote",
                table: "POSSessions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "OpenCash",
                table: "POSSessions",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Area",
                table: "Tables");

            migrationBuilder.DropColumn(
                name: "Capacity",
                table: "Tables");

            migrationBuilder.DropColumn(
                name: "CloseNote",
                table: "POSSessions");

            migrationBuilder.DropColumn(
                name: "OpenCash",
                table: "POSSessions");
        }
    }
}
