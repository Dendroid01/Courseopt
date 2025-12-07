using AutoMapper;
using Courseopt.Models;
using Courseopt.DTOs;
using Courseopt.Enums;
using System;
using System.Collections.Generic;

namespace Courseopt.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Product ↔ ProductDto
            CreateMap<Product, ProductDto>().ReverseMap();

            // Customer ↔ CustomerDto
            CreateMap<Customer, CustomerDto>().ReverseMap();

            // Supplier ↔ SupplierDto
            CreateMap<Supplier, SupplierDto>().ReverseMap();

            // OrderItem ↔ OrderItemDto
            CreateMap<OrderItem, OrderItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.ProductBarcodeNavigation.Name))
                .ReverseMap()
                .ForMember(dest => dest.ProductBarcodeNavigation, opt => opt.Ignore()); // не трогаем навигацию при обратном маппинге

            // Order ↔ OrderDto
            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.OrderItems))
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.CustomerInnNavigation.CompanyName))
                .ReverseMap()
                .ForMember(dest => dest.OrderItems, opt => opt.Ignore()) // коллекцию OrderItems маппить отдельно
                .ForMember(dest => dest.CustomerInnNavigation, opt => opt.Ignore());

            // DeliveryItem ↔ DeliveryItemDto
            CreateMap<DeliveryItem, DeliveryItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.ProductBarcodeNavigation.Name))
                .ReverseMap()
                .ForMember(dest => dest.ProductBarcodeNavigation, opt => opt.Ignore());

            // Delivery ↔ DeliveryDto
            CreateMap<Delivery, DeliveryDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.DeliveryItems))
                .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.SupplierInnNavigation.CompanyName))
                .ReverseMap()
                .ForMember(dest => dest.DeliveryItems, opt => opt.Ignore())
                .ForMember(dest => dest.SupplierInnNavigation, opt => opt.Ignore());


            CreateMap<ProductCategory, string>().ConvertUsing(src => src.ToString());
            CreateMap<string, ProductCategory>().ConvertUsing(src => Enum.Parse<ProductCategory>(src));

            CreateMap<ProductUnit, string>().ConvertUsing(src => src.ToString());
            CreateMap<string, ProductUnit>().ConvertUsing(src => Enum.Parse<ProductUnit>(src));

            CreateMap<Status, string>().ConvertUsing(src => src.ToString());
            CreateMap<string, Status>().ConvertUsing(src => Enum.Parse<Status>(src));
        }
    }
}