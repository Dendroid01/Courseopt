using System.Text.Json.Serialization;
using Courseopt.Enums;

namespace Courseopt.DTOs
{
    public class LoginResponseDto
    {
        public int UserId { get; set; }
        public string Username { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public UserRole Role { get; set; }
        public string Token { get; set; }
    }
}