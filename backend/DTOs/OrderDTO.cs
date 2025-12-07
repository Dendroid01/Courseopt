using Courseopt.Enums;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Courseopt.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    
    public string CustomerName { get; set; }
    public string CustomerInn { get; set; } = null!;
    public DateOnly OrderDate { get; set; }
    
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Status Status { get; set; }
    public decimal? TotalAmount { get; set; }

    public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
}