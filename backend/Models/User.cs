using System;
using System.Collections.Generic;
using Courseopt.Enums;

namespace Courseopt.Models;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public UserRole Role { get; set; }
}
