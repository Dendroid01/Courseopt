namespace Courseopt.DTOs;

public class CustomerDto
{
    public string Inn { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string? ContactPerson { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public string? MobilePhone { get; set; }
    public string? Email { get; set; }
}