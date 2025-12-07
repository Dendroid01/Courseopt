using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Courseopt.Models;

public partial class FoodWarehouseContext : DbContext
{
    public FoodWarehouseContext()
    {
    }

    public FoodWarehouseContext(DbContextOptions<FoodWarehouseContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Delivery> Deliveries { get; set; }

    public virtual DbSet<DeliveryItem> DeliveryItems { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<Supplier> Suppliers { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=food_warehouse;Username=postgres;Password=");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("product_category", new[] { "Крупы", "Макаронные изделия", "Мука_Сахар_Соль", "Снэки", "Безалкогольные_напитки", "Вода", "Растительные_масла", "Сладости", "Консервы", "Другое" })
            .HasPostgresEnum("product_unit", new[] { "кг", "шт", "уп" })
            .HasPostgresEnum("status", new[] { "в_обработке", "подтвержден", "оплачен", "отгружен", "завершен", "отменен" })
            .HasPostgresEnum("user_role", new[] { "accountant", "admin", "product_manager", "worker" })
            .HasPostgresExtension("pg_trgm");

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Inn).HasName("customer_pkey");

            entity.ToTable("customer");

            entity.HasIndex(e => e.City, "idx_customer_city");

            entity.Property(e => e.Inn)
                .HasMaxLength(12)
                .HasColumnName("inn");
            entity.Property(e => e.Bik)
                .HasMaxLength(9)
                .HasColumnName("bik");
            entity.Property(e => e.City)
                .HasMaxLength(100)
                .HasColumnName("city");
            entity.Property(e => e.CompanyName)
                .HasMaxLength(255)
                .HasColumnName("company_name");
            entity.Property(e => e.ContactPerson)
                .HasMaxLength(255)
                .HasColumnName("contact_person");
            entity.Property(e => e.CorrespondentAccount)
                .HasMaxLength(20)
                .HasColumnName("correspondent_account");
            entity.Property(e => e.Email)
                .HasMaxLength(150)
                .HasColumnName("email");
            entity.Property(e => e.MobilePhone)
                .HasMaxLength(20)
                .HasColumnName("mobile_phone");
            entity.Property(e => e.Region)
                .HasMaxLength(100)
                .HasColumnName("region");
            entity.Property(e => e.SettlementAccount)
                .HasMaxLength(20)
                .HasColumnName("settlement_account");
            entity.Property(e => e.Street)
                .HasMaxLength(255)
                .HasColumnName("street");
        });

        modelBuilder.Entity<Delivery>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("delivery_pkey");

            entity.ToTable("delivery");

            entity.HasIndex(e => e.SupplierInn, "idx_delivery_supplier");
            entity.HasIndex(e => new { e.Status, e.DeliveryDate }, "idx_delivery_status_date");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DeliveryDate).HasColumnName("delivery_date");
            entity.Property(e => e.SupplierInn)
                .HasMaxLength(12)
                .HasColumnName("supplier_inn");
            entity.Property(e => e.Status)
                .HasColumnName("status");
            entity.Property(e => e.TotalAmount)
                .HasPrecision(12, 2)
                .HasColumnName("total_amount");

            entity.HasOne(d => d.SupplierInnNavigation).WithMany(p => p.Deliveries)
                .HasForeignKey(d => d.SupplierInn)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("delivery_supplier_inn_fkey");
        });

        modelBuilder.Entity<DeliveryItem>(entity =>
        {
            entity.HasKey(e => new { e.ProductBarcode, e.DeliveryId }).HasName("delivery_item_pkey");

            entity.ToTable("delivery_item");

            entity.HasIndex(e => e.ProductBarcode, "idx_delivery_item_product");

            entity.Property(e => e.ProductBarcode)
                .HasMaxLength(50)
                .HasColumnName("product_barcode");
            entity.Property(e => e.DeliveryId).HasColumnName("delivery_id");
            entity.Property(e => e.ExpirationDate).HasColumnName("expiration_date");
            entity.Property(e => e.ProductionDate).HasColumnName("production_date");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.UnitPrice)
                .HasPrecision(12, 2)
                .HasColumnName("unit_price");

            entity.HasOne(d => d.Delivery).WithMany(p => p.DeliveryItems)
                .HasForeignKey(d => d.DeliveryId)
                .HasConstraintName("delivery_item_delivery_id_fkey");

            entity.HasOne(d => d.ProductBarcodeNavigation).WithMany(p => p.DeliveryItems)
                .HasForeignKey(d => d.ProductBarcode)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("delivery_item_product_barcode_fkey");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("orders_pkey");

            entity.ToTable("orders");

            entity.HasIndex(e => e.CustomerInn, "idx_orders_customer");
            entity.HasIndex(e => new { e.Status, e.OrderDate }, "idx_orders_status_date");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CustomerInn)
                .HasMaxLength(12)
                .HasColumnName("customer_inn");
            entity.Property(e => e.OrderDate).HasColumnName("order_date");
            entity.Property(e => e.Status)
                .HasColumnName("status");
            entity.Property(e => e.TotalAmount)
                .HasPrecision(12, 2)
                .HasColumnName("total_amount");

            entity.HasOne(d => d.CustomerInnNavigation).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CustomerInn)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("orders_customer_inn_fkey");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => new { e.OrderId, e.ProductBarcode }).HasName("order_item_pkey");

            entity.ToTable("order_item");

            entity.HasIndex(e => e.ProductBarcode, "idx_order_item_product");

            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.ProductBarcode)
                .HasMaxLength(50)
                .HasColumnName("product_barcode");
            entity.Property(e => e.FinalPrice)
                .HasPrecision(12, 2)
                .HasColumnName("final_price");
            entity.Property(e => e.MarkupPercent)
                .HasPrecision(5, 2)
                .HasColumnName("markup_percent");
            entity.Property(e => e.PriceAtOrder)
                .HasPrecision(12, 2)
                .HasColumnName("price_at_order");
            entity.Property(e => e.Quantity).HasColumnName("quantity");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("order_item_order_id_fkey");

            entity.HasOne(d => d.ProductBarcodeNavigation).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ProductBarcode)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("order_item_product_barcode_fkey");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Barcode).HasName("product_pkey");

            entity.ToTable("product");

            entity.HasIndex(e => e.Name, "idx_product_name_trgm")
                .HasMethod("gin")
                .HasOperators(new[] { "gin_trgm_ops" });

            entity.HasIndex(e => e.Category, "idx_product_category");

            entity.Property(e => e.Barcode)
                .HasMaxLength(50)
                .HasColumnName("barcode");
            entity.Property(e => e.Category)
                .HasColumnName("category");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Unit)
                .HasColumnName("unit");
            entity.Property(e => e.StorageDays).HasColumnName("storage_days");
            entity.Property(e => e.UnitPrice)
                .HasPrecision(12, 2)
                .HasColumnName("unit_price");
        });

        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.HasKey(e => e.Inn).HasName("supplier_pkey");

            entity.ToTable("supplier");

            entity.HasIndex(e => e.City, "idx_supplier_city");

            entity.Property(e => e.Inn)
                .HasMaxLength(12)
                .HasColumnName("inn");
            entity.Property(e => e.Bik)
                .HasMaxLength(9)
                .HasColumnName("bik");
            entity.Property(e => e.City)
                .HasMaxLength(100)
                .HasColumnName("city");
            entity.Property(e => e.CompanyName)
                .HasMaxLength(255)
                .HasColumnName("company_name");
            entity.Property(e => e.ContactPerson)
                .HasMaxLength(255)
                .HasColumnName("contact_person");
            entity.Property(e => e.CorrespondentAccount)
                .HasMaxLength(20)
                .HasColumnName("correspondent_account");
            entity.Property(e => e.Email)
                .HasMaxLength(150)
                .HasColumnName("email");
            entity.Property(e => e.MobilePhone)
                .HasMaxLength(20)
                .HasColumnName("mobile_phone");
            entity.Property(e => e.Region)
                .HasMaxLength(100)
                .HasColumnName("region");
            entity.Property(e => e.SettlementAccount)
                .HasMaxLength(20)
                .HasColumnName("settlement_account");
            entity.Property(e => e.Street)
                .HasMaxLength(255)
                .HasColumnName("street");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Username, "users_username_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .HasColumnName("password_hash");
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .HasColumnName("username");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
