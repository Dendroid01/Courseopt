using Courseopt.Enums;

namespace Courseopt.DTOs;
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public UserRole Role { get; set; }
    }