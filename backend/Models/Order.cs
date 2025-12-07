using System;
using System.Collections.Generic;
using Courseopt.Enums;

namespace Courseopt.Models;

public partial class Order
{
    public int Id { get; set; }

    public string CustomerInn { get; set; } = null!;

    public DateOnly OrderDate { get; set; }

    public Status Status { get; set; } = Status.в_обработке;

    public decimal? TotalAmount { get; set; }

    public virtual Customer CustomerInnNavigation { get; set; } = null!;

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
