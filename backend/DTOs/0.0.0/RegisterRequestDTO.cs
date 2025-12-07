using Courseopt.Enums;

namespace Courseopt.DTOs
{
    public class RegisterRequestDto
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public UserRole Role { get; set; } = UserRole.worker;
    }
}
