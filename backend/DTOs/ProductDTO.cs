using Courseopt.Enums;
using System.Text.Json.Serialization;

namespace Courseopt.DTOs;

public class ProductDto
{
    public string Barcode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public ProductCategory Category { get; set; }
    
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ProductUnit? Unit { get; set; }
    public decimal? UnitPrice { get; set; }
    public int CurrentStock { get; set; }
    public int? StorageDays { get; set; }
}
