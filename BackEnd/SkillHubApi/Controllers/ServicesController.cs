using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHubApi.Models;
using System.Collections.Generic;
using System.Linq;
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
    public async Task<ActionResult<IEnumerable<Service>>> GetServices()
    {
        return await _context.Services
            .Include(s => s.User)
            .Include(s => s.Category)
            .Include(s => s.SubCategory)
            .ToListAsync();
    }

    // GET: api/services/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Service>> GetService(int id)
    {
        var service = await _context.Services
            .Include(s => s.User)
            .Include(s => s.Category)
            .Include(s => s.SubCategory)
            .FirstOrDefaultAsync(s => s.ServiceID == id);

        if (service == null)
        {
            return NotFound();
        }

        return service;
    }

    // POST: api/services
    [HttpPost]
    public async Task<ActionResult<Service>> PostService(Service service)
    {
        _context.Services.Add(service);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetService), new { id = service.ServiceID }, service);
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

    private bool ServiceExists(int id)
    {
        return _context.Services.Any(e => e.ServiceID == id);
    }
}
