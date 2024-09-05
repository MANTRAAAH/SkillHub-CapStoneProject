using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHubApi.Models;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class ServicesController : ControllerBase
{
    private readonly SkillHubContext _context;

    public ServicesController(SkillHubContext context)
    {
        _context = context;
    }

    // GET: api/services
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceDto>>> GetServices()
    {
        var services = await _context.Services
            .Include(s => s.User)
            .Include(s => s.Category)
            .Include(s => s.SubCategory)
            .Select(s => new ServiceDto
            {
                ServiceID = s.ServiceID,
                Title = s.Title,
                Description = s.Description,
                Price = s.Price,
                CategoryName = s.Category.CategoryName,
                SubCategoryName = s.SubCategory.SubCategoryName,
                UserName = s.User.Username
            })
            .ToListAsync();

        return services;
    }


    // GET: api/services/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceDto>> GetService(int id)
    {
        var service = await _context.Services
            .Include(s => s.User)
            .Include(s => s.Category)
            .Include(s => s.SubCategory)
            .Where(s => s.ServiceID == id)
            .Select(s => new ServiceDto
            {
                ServiceID = s.ServiceID,
                Title = s.Title,
                Description = s.Description,
                Price = s.Price,
                CategoryName = s.Category.CategoryName,
                SubCategoryName = s.SubCategory.SubCategoryName,
                UserName = s.User.Username
            })
            .FirstOrDefaultAsync();

        if (service == null)
        {
            return NotFound();
        }

        return Ok(service);
    }


    // POST: api/services
    [HttpPost]
    public async Task<ActionResult<Service>> PostService(Service service)
    {
        _context.Services.Add(service);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetService), new { id = service.ServiceID }, service);
    }

    [HttpGet("random")]
    public async Task<ActionResult<IEnumerable<ServiceDto>>> GetRandomServices()
    {
        // Controlla quanti servizi ci sono nel database
        var totalServices = await _context.Services.CountAsync();
        Console.WriteLine($"Numero totale di servizi nel database: {totalServices}");

        var services = await _context.Services
                                     .Include(s => s.User)
                                     .Include(s => s.Category)
                                     .Include(s => s.SubCategory)
                                     .OrderBy(r => Guid.NewGuid())
                                     .Take(6)
                                     .Select(s => new ServiceDto
                                     {
                                         ServiceID = s.ServiceID,
                                         Title = s.Title,
                                         Description = s.Description,
                                         Price = s.Price,
                                         CategoryName = s.Category.CategoryName,
                                         SubCategoryName = s.SubCategory.SubCategoryName,
                                         UserName = s.User.Username
                                     })
                                     .ToListAsync();

        return services;
    }



    // PUT: api/services/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutService(int id, Service service)
    {
        if (id != service.ServiceID)
        {
            return BadRequest();
        }

        _context.Entry(service).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ServiceExists(id))
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

    // DELETE: api/services/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null)
        {
            return NotFound();
        }

        _context.Services.Remove(service);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    // GET: api/services/user-services
    [Authorize]
    [HttpGet("user-services")]
    public async Task<ActionResult<IEnumerable<ServiceDto>>> GetUserServices()
    {
        // Estrai l'ID dell'utente autenticato dal token JWT
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("Invalid or missing User ID in token.");
        }

        int parsedUserId = int.Parse(userId);

        // Ottieni tutti i servizi creati dall'utente
        var services = await _context.Services
            .Where(s => s.UserID == parsedUserId)
            .Include(s => s.Category)
            .Include(s => s.SubCategory)
            .Select(s => new ServiceDto
            {
                ServiceID = s.ServiceID,
                Title = s.Title,
                Description = s.Description,
                Price = s.Price,
                CategoryName = s.Category.CategoryName,
                SubCategoryName = s.SubCategory.SubCategoryName,
                UserName = s.User.Username
            })
            .ToListAsync();

        return Ok(services);
    }




    private bool ServiceExists(int id)
    {
        return _context.Services.Any(e => e.ServiceID == id);
    }
}
