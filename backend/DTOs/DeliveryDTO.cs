using Courseopt.Enums;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Courseopt.DTOs;

public class DeliveryDto
{
    public int Id { get; set; }
    public string SupplierName { get; set; }
    public string SupplierInn { get; set; } = null!;
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Status Status { get; set; }
    public DateOnly? DeliveryDate { get; set; }
    public decimal? TotalAmount { get; set; }

    public List<DeliveryItemDto> Items { get; set; } = new List<DeliveryItemDto>();
}
