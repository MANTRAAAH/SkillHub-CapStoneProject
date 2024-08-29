using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHubApi.Models;

[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly SkillHubContext _context;

    public OrdersController(SkillHubContext context)
    {
        _context = context;
    }

    // GET: api/orders
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
    {
        return await _context.Orders
                             .Include(o => o.Service)
                             .Include(o => o.Client)
                             .Include(o => o.Freelancer)
                             .ToListAsync();
    }

    // GET: api/orders/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(int id)
    {
        var order = await _context.Orders
                                  .Include(o => o.Service)
                                  .Include(o => o.Client)
                                  .Include(o => o.Freelancer)
                                  .FirstOrDefaultAsync(o => o.OrderID == id);

        if (order == null)
        {
            return NotFound();
        }

        return order;
    }

    // POST: api/orders
    [HttpPost]
    public async Task<ActionResult<Order>> PostOrder(Order order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOrder), new { id = order.OrderID }, order);
    }

    // PUT: api/orders/5
    [HttpPut("{id}")]
    public async Task<IActionResult> PutOrder(int id, Order order)
    {
        if (id != order.OrderID)
        {
            return BadRequest();
        }

        _context.Entry(order).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!OrderExists(id))
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

    // DELETE: api/orders/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null)
        {
            return NotFound();
        }

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool OrderExists(int id)
    {
        return _context.Orders.Any(e => e.OrderID == id);
    }
}
