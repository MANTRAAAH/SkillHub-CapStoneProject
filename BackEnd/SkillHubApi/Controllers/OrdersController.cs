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

    [Authorize]
    [HttpGet("user-orders")]
    public async Task<ActionResult<IEnumerable<OrderDetailsDto>>> GetUserOrders()
    {
        // Estrai l'ID dell'utente autenticato dal token JWT
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("Invalid or missing User ID in token.");
        }

        int parsedUserId = int.Parse(userId);

        // Ottieni tutti gli ordini dove l'utente è il cliente o il freelancer
        var orders = await _context.Orders
            .Where(o => o.ClientID == parsedUserId || o.FreelancerID == parsedUserId)
            .Include(o => o.Service)
            .Include(o => o.Client)
            .Include(o => o.Freelancer)
            .Select(o => new OrderDetailsDto
            {
                OrderID = o.OrderID,
                ServiceTitle = o.Service.Title,
                ClientUsername = o.Client.Username,
                FreelancerUsername = o.Freelancer.Username,
                OrderDate = o.OrderDate,
                Status = o.Status,
                TotalPrice = o.TotalPrice
            })
            .ToListAsync();

        return Ok(orders);
    }


    // GET: api/orders/5
    [Authorize]
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

        // Verifica che l'ordine sia dell'utente autenticato, sia come cliente che come freelancer
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (order.ClientID.ToString() != userId && order.FreelancerID.ToString() != userId)
        {
            return Unauthorized();
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
    [Authorize]
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
    [Authorize]
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
