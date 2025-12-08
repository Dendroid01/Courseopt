using Courseopt.Enums;
using System.Text.Json.Serialization;

namespace Courseopt.DTOs;

public class UserDTO
{
    public int Id { get; set; }
    public string Username { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public UserRole Role { get; set; }
}
public class AuthBaseDto
{
    public string Username { get; set; }
    public string Password { get; set; }
}

public class RegisterDto : AuthBaseDto
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public UserRole Role { get; set; }
}
