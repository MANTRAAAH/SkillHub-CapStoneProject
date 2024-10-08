﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHubApi.Models;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly SkillHubContext _context;
    private readonly IConfiguration _configuration;

    public UsersController(SkillHubContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // GET: api/users
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users.ToListAsync();
    }

    // GET: api/users/5
    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }

    // POST: api/users/register
    [HttpPost("register")]
    public async Task<ActionResult<User>> RegisterUser(UserRegistrationDto registrationDto)
    {
        if (await UserExists(registrationDto.Email))
        {
            return BadRequest("Email is already in use.");
        }

        using var hmac = new HMACSHA512();
        var user = new User
        {
            Username = registrationDto.Username,
            Email = registrationDto.Email,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registrationDto.Password)),
            PasswordSalt = hmac.Key,
            Role = "User",  // Default role
            CreatedDate = DateTime.UtcNow,
            IsOnline = false
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUser), new { id = user.UserID }, user);
    }

    // POST: api/users/login
    [HttpPost("login")]
    public async Task<ActionResult<string>> Login(UserLoginDto loginDto)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == loginDto.Email);
        if (user == null)
        {
            return Unauthorized("Invalid email.");
        }

        using var hmac = new HMACSHA512(user.PasswordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

        for (int i = 0; i < computedHash.Length; i++)
        {
            if (computedHash[i] != user.PasswordHash[i])
            {
                return Unauthorized("Invalid password.");
            }
        }

        var token = GenerateJwtToken(user);

        return Ok(new { token });
    }

    // PUT: api/users/5
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUser(int id, UserUpdateDto userUpdateDto)
    {
        if (id != int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        user.Username = userUpdateDto.Username ?? user.Username;
        user.Bio = userUpdateDto.Bio ?? user.Bio;
        user.ProfilePicture = userUpdateDto.ProfilePicture ?? user.ProfilePicture;

        _context.Entry(user).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/users/5
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        if (id != int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/users/update-password
    [Authorize]
    [HttpPut("update-password")]
    public async Task<IActionResult> UpdatePassword([FromBody] PasswordUpdateDto passwordUpdateDto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return NotFound();
        }

        using var hmac = new HMACSHA512(user.PasswordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(passwordUpdateDto.OldPassword));

        for (int i = 0; i < computedHash.Length; i++)
        {
            if (computedHash[i] != user.PasswordHash[i])
            {
                return Unauthorized("Old password is incorrect.");
            }
        }

        user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(passwordUpdateDto.NewPassword));
        await _context.SaveChangesAsync();

        return NoContent();
    }
    // GET: api/users/me
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<User>> GetCurrentUser()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
        {
            return NotFound();
        }

        return user;
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string searchTerm)
    {
        if (string.IsNullOrEmpty(searchTerm))
        {
            return BadRequest("Search term cannot be empty.");
        }

        var users = await _context.Users
            .Where(u => u.Username.Contains(searchTerm))
            .ToListAsync();

        return Ok(users);
    }
    [HttpPost("upload-profile-image")]
    public async Task<IActionResult> UploadProfileImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Nessun file è stato caricato.");
        }

        // Verifica se il file è un'immagine
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var extension = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest("Solo file immagine (.jpg, .jpeg, .png) sono accettati.");
        }

        // Definisci un nome unico per l'immagine
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Assicurati che l'ID utente sia disponibile
        var fileName = $"{userId}_{Guid.NewGuid()}{extension}";

        // Percorso dove salvare l'immagine
        var directoryPath = Path.Combine("wwwroot", "images", "profiles");

        // Crea la directory se non esiste
        if (!Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }

        var filePath = Path.Combine(directoryPath, fileName);

        // Salva l'immagine nel file system
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Salva il percorso dell'immagine nel database
        var user = await _context.Users.FindAsync(int.Parse(userId));  
        if (user == null)
        {
            return NotFound("Utente non trovato.");
        }

        user.ProfilePicture = $"/images/profiles/{fileName}";  
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return Ok(new { path = user.ProfilePicture });
        Console.WriteLine($"Immagine salvata in: {filePath}");

    }



    private async Task<bool> UserExists(string email)
    {
        return await _context.Users.AnyAsync(u => u.Email == email);
    }

    private bool UserExists(int id)
    {
        return _context.Users.Any(e => e.UserID == id);
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserID.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(ClaimTypes.Name, user.Username)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(double.Parse(_configuration["Jwt:ExpiresInMinutes"])),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
