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
    public class CustomersController : ControllerBase
    {
        private readonly FoodWarehouseContext _context;
        private readonly IMapper _mapper;

        public CustomersController(FoodWarehouseContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        [Authorize(Roles = "admin,product_manager")]
        public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
        {
            var customers = await _context.Customers.ToListAsync();
            return Ok(_mapper.Map<List<CustomerDto>>(customers));
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "admin,product_manager")]
        public async Task<ActionResult<CustomerDto>> GetCustomer(string id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();
            return Ok(_mapper.Map<CustomerDto>(customer));
        }

        [HttpPost]
        [Authorize(Roles = "admin,product_manager")]
        public async Task<ActionResult<CustomerDto>> CreateCustomer(CustomerDto dto)
        {
            var customer = _mapper.Map<Customer>(dto);
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCustomer), new { id = customer.Inn }, _mapper.Map<CustomerDto>(customer));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,product_manager")]
        public async Task<IActionResult> UpdateCustomer(string id, CustomerDto dto)
        {
            if (id != dto.Inn) return BadRequest();
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();

            _mapper.Map(dto, customer);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteCustomer(string id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound();
            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
