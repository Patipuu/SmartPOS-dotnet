using System.ComponentModel.DataAnnotations;

namespace API.Data.Entities;

public class KitchenStation
{
    [Key]
    public int StationId { get; set; }
    public int KitchenId { get; set; }
    public string Name { get; set; } = string.Empty;

    public Kitchen Kitchen { get; set; } = null!;
    public ICollection<KOT> KOTs { get; set; } = new List<KOT>();
}
