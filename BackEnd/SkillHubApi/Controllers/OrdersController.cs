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

    private readonly ILogger<OrdersController> _logger;

    public OrdersController(SkillHubContext context, ILogger<OrdersController> logger)
    {
        _context = context;
        _logger = logger;
    }


    [Authorize]
    [HttpGet("user-orders")]
    public async Task<ActionResult<IEnumerable<OrderDetailsDto>>> GetUserOrders(
        [FromQuery] string? status = null,
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] decimal? maxPrice = null)
    {
        // Estrai l'ID dell'utente autenticato dal token JWT
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("Invalid or missing User ID in token.");
        }

        int parsedUserId = int.Parse(userId);

        // Ottieni tutti gli ordini dove l'utente è il cliente o il freelancer
        var query = _context.Orders
            .Where(o => o.ClientID == parsedUserId || o.FreelancerID == parsedUserId)
            .Include(o => o.Service)
            .Include(o => o.Client)
            .Include(o => o.Freelancer)
            .AsQueryable();

        // Applica il filtro sullo stato dell'ordine, se fornito
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(o => o.Status == status);
        }

        // Filtra per data di inizio, se fornita
        if (dateFrom.HasValue)
        {
            query = query.Where(o => o.OrderDate >= dateFrom.Value);
        }

        // Filtra per data di fine, se fornita
        if (dateTo.HasValue)
        {
            query = query.Where(o => o.OrderDate <= dateTo.Value);
        }

        // Filtra per prezzo massimo, se fornito
        if (maxPrice.HasValue)
        {
            query = query.Where(o => o.TotalPrice <= maxPrice.Value);
        }

        // Esegui la query e restituisci i risultati
        var orders = await query
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

    [HttpGet("orders/stats")]
    public async Task<ActionResult<OrderStatsDto>> GetOrderStats()
    {
        // Log: inizio del metodo
        _logger.LogInformation("GetOrderStats method called.");

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("User ID is missing in the token.");
            return BadRequest("User ID is missing.");
        }

        int parsedUserId;
        if (!int.TryParse(userId, out parsedUserId))
        {
            _logger.LogError($"User ID '{userId}' is not a valid integer.");
            return BadRequest("Invalid User ID.");
        }

        // Log: userId verificato correttamente
        _logger.LogInformation($"User ID is: {parsedUserId}");

        try
        {
            var stats = await GetMonthlyOrderStats(parsedUserId);
            _logger.LogInformation("Stats retrieved successfully.");
            return Ok(stats);
        }
        catch (Exception ex)
        {
            // Log: eccezione durante il recupero delle statistiche
            _logger.LogError(ex, "An error occurred while retrieving order stats.");
            return StatusCode(500, "An error occurred while retrieving order stats.");
        }
    }



    private async Task<OrderStatsDto> GetMonthlyOrderStats(int userId)
    {
        _logger.LogInformation($"Fetching monthly order stats for user ID: {userId}");

        var orderStats = await _context.Orders
            .Where(o => o.FreelancerID == userId)
            .GroupBy(o => o.OrderDate.Month)
            .Select(g => new
            {
                Month = g.Key,
                TotalEarnings = g.Sum(o => o.TotalPrice),
                OrderCount = g.Count()
            })
            .ToListAsync();

        if (!orderStats.Any())
        {
            _logger.LogWarning($"No order stats found for user ID: {userId}");
        }
        else
        {
            _logger.LogInformation($"Retrieved {orderStats.Count} months of stats for user ID: {userId}");
        }

        return new OrderStatsDto
        {
            Months = orderStats.Select(s => s.Month).ToArray(),
            Earnings = orderStats.Select(s => s.TotalEarnings).ToArray(),
            OrdersCount = orderStats.Select(s => s.OrderCount).ToArray()
        };
    }






    private bool OrderExists(int id)
    {
        return _context.Orders.Any(e => e.OrderID == id);
    }
}
