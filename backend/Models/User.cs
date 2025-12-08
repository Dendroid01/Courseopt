using System;
using System.Collections.Generic;
using Courseopt.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Courseopt.Models;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    [Column("role")]
    public UserRole Role { get; set; }
}
