using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillHubApi.Models;
using System.Security.Claims;

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
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Order>> PlaceOrder(OrderDto orderDto)
    {
        // Estrai l'ID dell'utente autenticato dal token JWT
        var clientId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(clientId))
        {
            return BadRequest("Invalid or missing Client ID in token.");
        }

        // Converti l'ID utente in int
        int parsedClientId = int.Parse(clientId);

        var service = await _context.Services.FindAsync(orderDto.ServiceID);

        if (service == null)
        {
            return NotFound("Service not found.");
        }

        var order = new Order
        {
            ServiceID = orderDto.ServiceID,
            ClientID = parsedClientId, // Usa l'ID del client estratto dal token
            FreelancerID = service.UserID, // L'ID del freelancer è l'utente che ha creato il servizio
            OrderDate = DateTime.UtcNow,
            Status = "Pending",
            TotalPrice = orderDto.TotalPrice,
            PaymentStatus = "Pending",  // Questo sarà aggiornato una volta che Stripe è integrato
            StripePaymentID = orderDto.StripePaymentID
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return Ok(order);
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
