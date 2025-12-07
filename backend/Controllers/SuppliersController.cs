using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Courseopt.Models;
using Courseopt.DTOs;

namespace Courseopt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuppliersController : ControllerBase
    {
        private readonly FoodWarehouseContext _context;
        private readonly IMapper _mapper;

        public SuppliersController(FoodWarehouseContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SupplierDto>>> GetSuppliers()
        {
            var suppliers = await _context.Suppliers.ToListAsync();
            return Ok(_mapper.Map<List<SupplierDto>>(suppliers));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SupplierDto>> GetSupplier(string id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound();
            return Ok(_mapper.Map<SupplierDto>(supplier));
        }

        [HttpPost]
        public async Task<ActionResult<SupplierDto>> CreateSupplier(SupplierDto dto)
        {
            var supplier = _mapper.Map<Supplier>(dto);
            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Inn }, _mapper.Map<SupplierDto>(supplier));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSupplier(string id, SupplierDto dto)
        {
            if (id != dto.Inn) return BadRequest();
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound();

            _mapper.Map(dto, supplier);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplier(string id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound();
            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
