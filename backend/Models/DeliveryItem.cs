using System;
using System.Collections.Generic;

namespace Courseopt.Models;

public partial class DeliveryItem
{
    public string ProductBarcode { get; set; } = null!;

    public int DeliveryId { get; set; }

    public int Quantity { get; set; }

    public decimal? UnitPrice { get; set; }

    public DateOnly? ProductionDate { get; set; }

    public DateOnly? ExpirationDate { get; set; }

    public virtual Delivery Delivery { get; set; } = null!;

    public virtual Product ProductBarcodeNavigation { get; set; } = null!;
}
