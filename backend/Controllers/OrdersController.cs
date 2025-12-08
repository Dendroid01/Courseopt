using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Courseopt.Models;
using Courseopt.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace Courseopt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly FoodWarehouseContext _context;
        private readonly IMapper _mapper;

        public OrdersController(FoodWarehouseContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/Orders
        [HttpGet]
        [Authorize(Roles = "admin,product_manager,worker,accountant")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductBarcodeNavigation)
                .Include(o => o.CustomerInnNavigation)
                .ToListAsync();

            return Ok(_mapper.Map<List<OrderDto>>(orders));
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        [Authorize(Roles = "admin,product_manager,worker,accountant")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.ProductBarcodeNavigation)
                .Include(o => o.CustomerInnNavigation)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();

            return Ok(_mapper.Map<OrderDto>(order));
        }

        // POST: api/Orders
        [HttpPost]
        [Authorize(Roles = "admin,product_manager,worker")]
        public async Task<ActionResult<OrderDto>> CreateOrder(OrderDto dto)
        {
            var order = _mapper.Map<Order>(dto);

            // Маппинг OrderItems через AutoMapper
            order.OrderItems = dto.Items
                .Select(i => _mapper.Map<OrderItem>(i))
                .ToList();

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Загружаем навигационные свойства для возврата DTO
            await _context.Entry(order)
                .Collection(o => o.OrderItems)
                .Query()
                .Include(oi => oi.ProductBarcodeNavigation)
                .LoadAsync();

            await _context.Entry(order)
                .Reference(o => o.CustomerInnNavigation)
                .LoadAsync();

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, _mapper.Map<OrderDto>(order));
        }

        // PUT: api/Orders/5
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,product_manager,worker")]
        public async Task<ActionResult<OrderDto>> UpdateOrder(int id, OrderDto dto)
        {
            if (id != dto.Id) return BadRequest();

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();

            // Обновляем основные свойства заказа
            _mapper.Map(dto, order);

            var incomingItems = dto.Items.ToDictionary(i => i.ProductBarcode);
            var existingItems = order.OrderItems.ToDictionary(i => i.ProductBarcode);

            // Удаляем отсутствующие
            var toRemove = order.OrderItems.Where(oi => !incomingItems.ContainsKey(oi.ProductBarcode)).ToList();
            _context.OrderItems.RemoveRange(toRemove);

            // Обновляем существующие и добавляем новые
            foreach (var itemDto in dto.Items)
            {
                if (existingItems.TryGetValue(itemDto.ProductBarcode, out var existing))
                {
                    existing.Quantity = itemDto.Quantity;
                    existing.PriceAtOrder = itemDto.PriceAtOrder;
                    existing.MarkupPercent = itemDto.MarkupPercent;
                    existing.FinalPrice = existing.PriceAtOrder * (1 + existing.MarkupPercent / 100);
                }
                else
                {
                    var newItem = _mapper.Map<OrderItem>(itemDto);
                    newItem.FinalPrice = newItem.PriceAtOrder * (1 + newItem.MarkupPercent / 100);
                    order.OrderItems.Add(newItem);
                }
            }

            await _context.SaveChangesAsync();

            // Загружаем обновлённые связи
            await _context.Entry(order)
                .Collection(o => o.OrderItems)
                .Query()
                .Include(oi => oi.ProductBarcodeNavigation)
                .LoadAsync();

            await _context.Entry(order)
                .Reference(o => o.CustomerInnNavigation)
                .LoadAsync();

            return Ok(_mapper.Map<OrderDto>(order));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);

            if (order == null)
                return NotFound();

            _context.Orders.Remove(order); // каскадное удаление сработает автоматически
            await _context.SaveChangesAsync();

            return NoContent();
        }




    }
}