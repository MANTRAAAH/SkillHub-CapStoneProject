using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHubApi.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly SkillHubContext _context;

    public CategoriesController(SkillHubContext context)
    {
        _context = context;
    }

    // GET: api/categories
    [HttpGet] // Rimuovi "categories" dal percorso
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        var categories = await _context.Categories
            .Select(c => new CategoryDto
            {
                CategoryID = c.CategoryID,
                CategoryName = c.CategoryName,
                SubCategories = c.SubCategories.Select(sc => new SubCategoryDto
                {
                    SubCategoryID = sc.SubCategoryID,
                    SubCategoryName = sc.SubCategoryName
                }).ToList()
            })
            .ToListAsync();

        return Ok(categories);
    }
    // GET: api/categories/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(int id)
    {
        var category = await _context.Categories
            .Include(c => c.SubCategories)
            .Select(c => new CategoryDto
            {
                CategoryID = c.CategoryID,
                CategoryName = c.CategoryName,
                SubCategories = c.SubCategories.Select(sc => new SubCategoryDto
                {
                    SubCategoryID = sc.SubCategoryID,
                    SubCategoryName = sc.SubCategoryName
                }).ToList()
            })
            .FirstOrDefaultAsync(c => c.CategoryID == id);

        if (category == null)
        {
            return NotFound();
        }

        return Ok(category);
    }


    // POST: api/categories
    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryID }, category);
    }

    // PUT: api/categories/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, Category category)
    {
        if (id != category.CategoryID)
        {
            return BadRequest();
        }

        _context.Entry(category).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CategoryExists(id))
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

    // DELETE: api/categories/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CategoryExists(int id)
    {
        return _context.Categories.Any(e => e.CategoryID == id);
    }
}
