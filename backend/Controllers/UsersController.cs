using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Courseopt.Models;
using Courseopt.DTOs;
using Courseopt.Enums;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;

namespace Courseopt.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly FoodWarehouseContext _context;
        private readonly IMapper _mapper;

        public UsersController(FoodWarehouseContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // -----------------------------------
        //              GET ALL
        // -----------------------------------
        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetAll()
        {
            var users = await _context.Users.ToListAsync();
            var usersDto = _mapper.Map<List<UserDTO>>(users);
            return Ok(usersDto);
        }

        // -----------------------------------
        //              UPDATE
        // -----------------------------------
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, RegisterDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _mapper.Map(dto, user); // мапим все свойства из DTO
            if (!string.IsNullOrEmpty(dto.Password))
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<UserDTO>> Create([FromBody] RegisterDto dto)
        {
            if (string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
                return BadRequest("Username и Password обязательны");

            // Проверка на уникальность username
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return BadRequest("Пользователь с таким username уже существует");

            var user = _mapper.Map<User>(dto);
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userDto = _mapper.Map<UserDTO>(user);
            return CreatedAtAction(nameof(GetAll), new { id = user.Id }, userDto);
        }
        // -----------------------------------
        //              DELETE
        // -----------------------------------
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
