using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Courseopt.Models;
using Courseopt.Enums;
using Courseopt.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace Courseopt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly FoodWarehouseContext _context;
        private readonly IMapper _mapper;

        public ProductsController(FoodWarehouseContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        [Authorize(Roles = "admin,product_manager,worker,accountant")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            // Получаем все продукты
            var products = await _context.Products.ToListAsync();

            // Суммы доставок по каждому продукту с нужными статусами
            var deliveredSums = await _context.DeliveryItems
                .Where(di => di.Delivery.Status == Status.отгружен || di.Delivery.Status == Status.завершен)
                .GroupBy(di => di.ProductBarcode)
                .Select(g => new
                {
                    ProductBarcode = g.Key,
                    TotalDelivered = g.Sum(di => di.Quantity)
                })
                .ToListAsync();

            // Суммы заказов по каждому продукту с нужными статусами
            var orderedSums = await _context.OrderItems
                .Where(oi => oi.Order.Status != Status.в_обработке && oi.Order.Status != Status.отменен)
                .GroupBy(oi => oi.ProductBarcode)
                .Select(g => new
                {
                    ProductBarcode = g.Key,
                    TotalOrdered = g.Sum(oi => oi.Quantity)
                })
                .ToListAsync();

            // Формируем DTO с расчетом фактического остатка
            var productDtos = products.Select(p =>
            {
                var totalDelivered = deliveredSums
                    .FirstOrDefault(d => d.ProductBarcode == p.Barcode)?.TotalDelivered ?? 0;

                var totalOrdered = orderedSums
                    .FirstOrDefault(o => o.ProductBarcode == p.Barcode)?.TotalOrdered ?? 0;

                var currentStock = totalDelivered - totalOrdered;

                var dto = _mapper.Map<ProductDto>(p);
                dto.CurrentStock = currentStock;
                return dto;
            }).ToList();

            return Ok(productDtos);
        }



        [HttpGet("{id}")]
        [Authorize(Roles = "admin,product_manager,worker,accountant")]
        public async Task<ActionResult<ProductDto>> GetProduct(string id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            return Ok(_mapper.Map<ProductDto>(product));
        }

        [HttpPost]
        [Authorize(Roles = "admin,product_manager")]
        public async Task<ActionResult<ProductDto>> CreateProduct(ProductDto dto)
        {
            var product = _mapper.Map<Product>(dto);
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProduct), new { id = product.Barcode }, _mapper.Map<ProductDto>(product));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,product_manager")]
        public async Task<IActionResult> UpdateProduct(string id, ProductDto dto)
        {
            if (id != dto.Barcode) return BadRequest();
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _mapper.Map(dto, product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteProduct(string id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
