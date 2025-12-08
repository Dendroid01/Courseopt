using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Courseopt.Models;
using Courseopt.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace Courseopt.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly FoodWarehouseContext _context;
        private readonly IConfiguration _config;

        public AuthController(FoodWarehouseContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // -----------------------------------
        //               LOGIN
        // -----------------------------------
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponseDto>> Login(AuthBaseDto dto)
        {
            var user = await _context.Users
                .SingleOrDefaultAsync(u => u.Username == dto.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid username or password");

            string token = GenerateJwt(user);

            return new LoginResponseDto
            {
                UserId = user.Id,
                Username = user.Username,
                Role = user.Role,
                Token = token
            };
        }

        // -----------------------------------
        //              REGISTER
        // -----------------------------------
        [HttpPost("register")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<UserDTO>> Register(RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return Conflict("User already exists");

            var newUser = new User
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new UserDTO
            {
                Id = newUser.Id,
                Username = newUser.Username,
                Role = newUser.Role
            });
        }

        // -----------------------------------
        //            JWT GENERATION
        // -----------------------------------
        private string GenerateJwt(User user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"])
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("userId", user.Id.ToString()),
                new Claim("username", user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(6),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}