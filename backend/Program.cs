using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using AutoMapper;
using Courseopt.Models;
using Courseopt.Enums;
using Courseopt.Profiles;
using Npgsql;
using System.Text.Json.Serialization;

NpgsqlConnection.GlobalTypeMapper.MapEnum<Status>("status");
NpgsqlConnection.GlobalTypeMapper.MapEnum<ProductCategory>("product_category");
NpgsqlConnection.GlobalTypeMapper.MapEnum<UserRole>("user_role");
NpgsqlConnection.GlobalTypeMapper.MapEnum<ProductUnit>("product_unit");


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<FoodWarehouseContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAutoMapper(typeof(MappingProfile));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
/*
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
*/
var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

//app.UseAuthentication();
//app.UseAuthorization();

app.MapControllers();

app.Run();
