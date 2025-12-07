using System;
using System.Collections.Generic;
using Courseopt.Enums;

namespace Courseopt.Models;

public partial class Delivery
{
    public int Id { get; set; }

    public string SupplierInn { get; set; } = null!;

    public Status Status { get; set; } = Status.в_обработке;

    public DateOnly? DeliveryDate { get; set; }

    public decimal? TotalAmount { get; set; }

    public virtual ICollection<DeliveryItem> DeliveryItems { get; set; } = new List<DeliveryItem>();

    public virtual Supplier SupplierInnNavigation { get; set; } = null!;
}
