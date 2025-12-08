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
    public class DeliveriesController : ControllerBase
    {
        private readonly FoodWarehouseContext _context;
        private readonly IMapper _mapper;

        public DeliveriesController(FoodWarehouseContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET all deliveries
        [HttpGet]
        [Authorize(Roles = "admin,product_manager,accountant,worker")]
        public async Task<ActionResult<IEnumerable<DeliveryDto>>> GetDeliveries()
        {
            var deliveries = await _context.Deliveries
                .Include(d => d.DeliveryItems)
                    .ThenInclude(di => di.ProductBarcodeNavigation)
                .Include(d => d.SupplierInnNavigation)
                .ToListAsync();

            return Ok(_mapper.Map<List<DeliveryDto>>(deliveries));
        }

        // GET delivery by ID
        [HttpGet("{id}")]
        [Authorize(Roles = "admin,product_manager,accountant,worker")]
        public async Task<ActionResult<DeliveryDto>> GetDelivery(int id)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.DeliveryItems)
                    .ThenInclude(di => di.ProductBarcodeNavigation)
                .Include(d => d.SupplierInnNavigation)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (delivery == null)
                return NotFound();

            return Ok(_mapper.Map<DeliveryDto>(delivery));
        }

        // POST
        [HttpPost]
        [Authorize(Roles = "admin,product_manager")]
        public async Task<ActionResult<DeliveryDto>> CreateDelivery(DeliveryDto dto)
        {
            var delivery = _mapper.Map<Delivery>(dto);

            // Map DeliveryItems manually
            delivery.DeliveryItems = dto.Items
                .Select(i => _mapper.Map<DeliveryItem>(i))
                .ToList();

            // Calculate total amount
            delivery.TotalAmount = delivery.DeliveryItems.Sum(i => (i.UnitPrice ?? 0) * i.Quantity);

            _context.Deliveries.Add(delivery);
            await _context.SaveChangesAsync();

            // Reload navigation properties for response
            await _context.Entry(delivery)
                .Collection(d => d.DeliveryItems)
                .Query()
                .Include(di => di.ProductBarcodeNavigation)
                .LoadAsync();

            await _context.Entry(delivery)
                .Reference(d => d.SupplierInnNavigation)
                .LoadAsync();

            return CreatedAtAction(nameof(GetDelivery), new { id = delivery.Id }, _mapper.Map<DeliveryDto>(delivery));
        }

        // PUT
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,product_manager")]
        public async Task<ActionResult<DeliveryDto>> UpdateDelivery(int id, DeliveryDto dto)
        {
            if (id != dto.Id)
                return BadRequest();

            var delivery = await _context.Deliveries
                .Include(d => d.DeliveryItems)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (delivery == null)
                return NotFound();

            // Update base fields
            _mapper.Map(dto, delivery);

            var incomingItems = dto.Items.ToDictionary(i => i.ProductBarcode);
            var existingItems = delivery.DeliveryItems.ToDictionary(i => i.ProductBarcode);

            // Remove missing
            var toRemove = delivery.DeliveryItems.Where(i => !incomingItems.ContainsKey(i.ProductBarcode)).ToList();
            _context.DeliveryItems.RemoveRange(toRemove);

            // Update existing + add new
            foreach (var itemDto in dto.Items)
            {
                if (existingItems.TryGetValue(itemDto.ProductBarcode, out var existing))
                {
                    existing.Quantity = itemDto.Quantity;
                    existing.UnitPrice = itemDto.UnitPrice;
                    existing.ProductionDate = itemDto.ProductionDate;
                    existing.ExpirationDate = itemDto.ExpirationDate;
                }
                else
                {
                    var newItem = _mapper.Map<DeliveryItem>(itemDto);
                    delivery.DeliveryItems.Add(newItem);
                }
            }

            // Recalculate total amount
            delivery.TotalAmount = delivery.DeliveryItems.Sum(i => (i.UnitPrice ?? 0) * i.Quantity);

            await _context.SaveChangesAsync();

            // Reload navigation props
            await _context.Entry(delivery)
                .Collection(d => d.DeliveryItems)
                .Query()
                .Include(di => di.ProductBarcodeNavigation)
                .LoadAsync();

            await _context.Entry(delivery)
                .Reference(d => d.SupplierInnNavigation)
                .LoadAsync();

            return Ok(_mapper.Map<DeliveryDto>(delivery));
        }

        // DELETE
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteDelivery(int id)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.DeliveryItems)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (delivery == null)
                return NotFound();

            _context.DeliveryItems.RemoveRange(delivery.DeliveryItems);
            _context.Deliveries.Remove(delivery);

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}