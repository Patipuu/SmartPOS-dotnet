using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class Checklist
{
    [Key]
    public int ChecklistId { get; set; }
    public string Type { get; set; } = string.Empty;

    public ICollection<OperationalAlert> OperationalAlerts { get; set; } = new List<OperationalAlert>();
}
