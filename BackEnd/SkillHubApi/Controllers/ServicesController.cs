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
                CategoryId = s.CategoryID,
                SubCategoryId = s.SubCategoryID,
                CategoryName = s.Category.CategoryName,
                SubCategoryName = s.SubCategory.SubCategoryName,
                UserName = s.User.Username,
                ImagePath = s.ImagePath
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
                UserID= s.UserID,
                Title = s.Title,
                Description = s.Description,
                Price = s.Price,
                CategoryId = s.CategoryID,
                SubCategoryId = s.SubCategoryID,
                CategoryName = s.Category.CategoryName,
                SubCategoryName = s.SubCategory.SubCategoryName,
                UserName = s.User.Username,
                ImagePath = s.ImagePath
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
    public async Task<ActionResult<Service>> PostService([FromForm] Service service, IFormFile image)
    {
        // Estrai l'ID utente dal token JWT
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("Invalid or missing User ID.");
        }

        // Converti l'ID utente in un numero intero
        service.UserID = int.Parse(userId);

        if (image != null && image.Length > 0)
        {
            // Percorso per salvare l'immagine
            var imagePath = Path.Combine("wwwroot", "images", "services", image.FileName);

            // Salva l'immagine sul server
            using (var stream = new FileStream(imagePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            // Imposta il percorso dell'immagine nel servizio
            service.ImagePath = $"/images/services/{image.FileName}";
            Console.WriteLine($"Percorso immagine assegnato: {service.ImagePath}");
        }

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
                                         CategoryId= s.CategoryID,
                                         SubCategoryId = s.SubCategoryID,
                                         CategoryName = s.Category.CategoryName,
                                         SubCategoryName = s.SubCategory.SubCategoryName,
                                         UserName = s.User.Username,
                                         ImagePath = s.ImagePath,
                                     })
                                     .ToListAsync();

        return services;
    }

    // PUT: api/services/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutService(int id, [FromForm] Service service, IFormFile image)
    {
        if (id != service.ServiceID)
        {
            return BadRequest("ID del servizio non corrisponde.");
        }

        // Recupera il servizio esistente dal database
        var existingService = await _context.Services.FindAsync(id);
        if (existingService == null)
        {
            return NotFound("Servizio non trovato.");
        }

        // Aggiorna le proprietà del servizio esistente
        existingService.Title = service.Title;
        existingService.Description = service.Description;
        existingService.Price = service.Price;
        existingService.CategoryID = service.CategoryID;
        existingService.SubCategoryID = service.SubCategoryID;
        existingService.UserID = service.UserID;

        // Processa l'immagine se presente
        if (image != null && image.Length > 0)
        {
            // Percorso per salvare l'immagine
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "services");

            // Crea la cartella se non esiste
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Crea un nome file unico
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + Path.GetFileName(image.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Salva la nuova immagine
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            // Elimina l'immagine precedente se esiste
            if (!string.IsNullOrEmpty(existingService.ImagePath))
            {
                var oldImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", existingService.ImagePath.TrimStart('/'));
                if (System.IO.File.Exists(oldImagePath))
                {
                    System.IO.File.Delete(oldImagePath);
                }
            }

            // Aggiorna il percorso dell'immagine nel servizio
            existingService.ImagePath = $"/images/services/{uniqueFileName}";
        }

        // Aggiorna lo stato dell'entità
        _context.Entry(existingService).State = EntityState.Modified;

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
            .Select(s => new ServiceDto
            {
                ServiceID = s.ServiceID,
                Title = s.Title,
                Description = s.Description,
                Price = s.Price,
                CategoryId = s.CategoryID,
                SubCategoryId = s.SubCategoryID,
                CategoryName = s.Category.CategoryName,
                SubCategoryName = s.SubCategory.SubCategoryName,
                UserName = s.User.Username,
                ImagePath= s.ImagePath
            })
            .ToListAsync();

        return Ok(services);
    }




    private bool ServiceExists(int id)
    {
        return _context.Services.Any(e => e.ServiceID == id);
    }
}
