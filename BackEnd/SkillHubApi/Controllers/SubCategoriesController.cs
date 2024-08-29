using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHubApi.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class SubCategoriesController : ControllerBase
{
    private readonly SkillHubContext _context;

    public SubCategoriesController(SkillHubContext context)
    {
        _context = context;
    }

    // GET: api/subcategories
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SubCategory>>> GetSubCategories()
    {
        return await _context.SubCategories.Include(sc => sc.Category).ToListAsync();
    }

    // GET: api/subcategories/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SubCategory>> GetSubCategory(int id)
    {
        var subCategory = await _context.SubCategories.Include(sc => sc.Category).FirstOrDefaultAsync(sc => sc.SubCategoryID == id);

        if (subCategory == null)
        {
            return NotFound();
        }

        return subCategory;
    }

    // POST: api/subcategories
    [HttpPost]
    public async Task<ActionResult<SubCategory>> CreateSubCategory(SubCategory subCategory)
    {
        // Verifica se la categoria esiste
        var category = await _context.Categories.FindAsync(subCategory.CategoryID);
        if (category == null)
        {
            return BadRequest("Invalid CategoryID");
        }

        // Aggiungi la nuova subcategory
        _context.SubCategories.Add(subCategory);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSubCategory), new { id = subCategory.SubCategoryID }, subCategory);
    }


    // PUT: api/subcategories/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSubCategory(int id, SubCategory subCategory)
    {
        if (id != subCategory.SubCategoryID)
        {
            return BadRequest();
        }

        _context.Entry(subCategory).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SubCategoryExists(id))
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

    // DELETE: api/subcategories/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSubCategory(int id)
    {
        var subCategory = await _context.SubCategories.FindAsync(id);
        if (subCategory == null)
        {
            return NotFound();
        }

        _context.SubCategories.Remove(subCategory);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool SubCategoryExists(int id)
    {
        return _context.SubCategories.Any(e => e.SubCategoryID == id);
    }
}
