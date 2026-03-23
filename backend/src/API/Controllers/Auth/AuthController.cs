using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.Data.DbContext;
using API.Models.DTOs;
using API.Services;

namespace API.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ApplicationDbContext _db;

    public AuthController(IAuthService authService, ApplicationDbContext db)
    {
        _authService = authService;
        _db = db;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Username and password are required" });

        var result = await _authService.LoginAsync(request);
        if (result == null)
            return Unauthorized(new { message = "Invalid username or password" });

        return Ok(result);
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { message = "Logout successful" });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrEmpty(request.NewPassword) || request.NewPassword.Length < 6)
            return BadRequest(new { message = "Mật khẩu mới tối thiểu 6 ký tự" });
        if (request.NewPassword == request.CurrentPassword)
            return BadRequest(new { message = "Mật khẩu mới phải khác mật khẩu hiện tại" });

        var userId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var uid) ? uid : 0;
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return Unauthorized();
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Mật khẩu hiện tại không đúng" });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, 12);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Đổi mật khẩu thành công" });
    }
}
