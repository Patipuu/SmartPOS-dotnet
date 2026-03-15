using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class OperationalAlert
{
    [Key]
    public int AlertId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? OrderId { get; set; }
    public int? ChecklistId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Order? Order { get; set; }
    public Checklist? Checklist { get; set; }
}
