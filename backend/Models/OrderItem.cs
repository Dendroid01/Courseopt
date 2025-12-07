using System;
using System.Collections.Generic;

namespace Courseopt.Models;

public partial class OrderItem
{
    public int OrderId { get; set; }

    public string ProductBarcode { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal? MarkupPercent { get; set; }

    public decimal? PriceAtOrder { get; set; }

    public decimal? FinalPrice { get; set; }

    public virtual Order Order { get; set; } = null!;

    public virtual Product ProductBarcodeNavigation { get; set; } = null!;
}
