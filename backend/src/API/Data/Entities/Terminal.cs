using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class Terminal
{
    [Key]
    public int TerminalId { get; set; }
    public string Location { get; set; } = string.Empty;

    public ICollection<POSSession> POSSessions { get; set; } = new List<POSSession>();
}
