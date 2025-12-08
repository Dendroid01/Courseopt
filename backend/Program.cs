using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AutoMapper;
using Courseopt.Models;
using Courseopt.Profiles;
using Npgsql;
using System.Text.Json.Serialization;
using Courseopt.Enums;

// ---------------------------
// PostgreSQL enum mapping
// ---------------------------
NpgsqlConnection.GlobalTypeMapper.MapEnum<Status>("status");
NpgsqlConnection.GlobalTypeMapper.MapEnum<ProductCategory>("product_category");
NpgsqlConnection.GlobalTypeMapper.MapEnum<UserRole>("user_role");
NpgsqlConnection.GlobalTypeMapper.MapEnum<ProductUnit>("product_unit");

// ---------------------------
// Builder
// ---------------------------
var builder = WebApplication.CreateBuilder(args);

// ---------------------------
// DB Context
// ---------------------------
builder.Services.AddDbContext<FoodWarehouseContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ---------------------------
// AutoMapper
// ---------------------------
builder.Services.AddAutoMapper(typeof(MappingProfile));

// ---------------------------
// CORS
// ---------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ---------------------------
// Controllers + JSON options
// ---------------------------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// ---------------------------
// JWT Authentication
// ---------------------------
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// ---------------------------
// Build app
// ---------------------------
var app = builder.Build();

// ---------------------------
// Middleware
// ---------------------------
app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication(); // <- включаем JWT
app.UseAuthorization();

// ---------------------------
// Map Controllers
// ---------------------------
app.MapControllers();

app.Run();