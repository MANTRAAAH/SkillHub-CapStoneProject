using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SkillHubApi.Models;
using System.Security.Claims;

[Route("api/orders")]
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
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("Invalid or missing User ID in token.");
        }

        int parsedUserId = int.Parse(userId);

        var query = _context.Orders
            .Where(o => o.ClientID == parsedUserId || o.FreelancerID == parsedUserId)
            .Include(o => o.Service)
            .Include(o => o.Client)
            .Include(o => o.Freelancer)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(o => o.Status == status);
        }

        if (dateFrom.HasValue)
        {
            query = query.Where(o => o.OrderDate >= dateFrom.Value);
        }

        if (dateTo.HasValue)
        {
            query = query.Where(o => o.OrderDate <= dateTo.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(o => o.TotalPrice <= maxPrice.Value);
        }

        var orders = await query
            .Select(o => new OrderDetailsDto
            {
                OrderID = o.OrderID,
                ServiceTitle = o.Service.Title,
                ClientUsername = o.Client.Username,
                FreelancerUsername = o.Freelancer.Username,
                OrderDate = o.OrderDate,
                Status = o.Status,
                PaymentStatus = o.PaymentStatus,
                TotalPrice = o.TotalPrice,
                OrderFiles = o.Files.Select(f => new OrderFileDto
                {
                    OrderFileID = f.OrderFileID,
                    FilePath = f.FilePath
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    // POST: api/orders/{orderId}/upload-files
    [Authorize(Roles = "Freelancer")]
    [HttpPost("{orderId}/upload-files")]
    public async Task<IActionResult> UploadOrderFiles(int orderId, List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest("Nessun file è stato caricato.");
        }

        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
        {
            return NotFound("Ordine non trovato.");
        }

        foreach (var file in files)
        {
            var fileName = $"{orderId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine("wwwroot", "files", "orders", fileName);

            if (!Directory.Exists(Path.Combine("wwwroot", "files", "orders")))
            {
                Directory.CreateDirectory(Path.Combine("wwwroot", "files", "orders"));
            }

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var orderFile = new OrderFile
            {
                OrderID = orderId,
                FilePath = $"/files/orders/{fileName}"
            };

            _context.OrderFiles.Add(orderFile);
        }

        await _context.SaveChangesAsync();

        return Ok(new {message ="File caricati con successo." });
    }

    // GET: api/orders/{orderId}/download-file/{fileId}
    [Authorize]
    [HttpGet("{orderId}/download-file/{fileId}")]
    public async Task<IActionResult> DownloadOrderFile(int orderId, int fileId)
    {
        var orderFile = await _context.OrderFiles
                                      .Where(of => of.OrderID == orderId && of.OrderFileID == fileId)
                                      .FirstOrDefaultAsync();

        if (orderFile == null)
        {
            return NotFound("File dell'ordine non trovato.");
        }

        var filePath = Path.Combine("wwwroot", orderFile.FilePath.TrimStart('/'));

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound("File non trovato.");
        }

        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        var fileExtension = Path.GetExtension(orderFile.FilePath);
        var contentType = fileExtension switch
        {
            ".jpg" => "image/jpeg",
            ".png" => "image/png",
            ".pdf" => "application/pdf",
            _ => "application/octet-stream"
        };

        return File(fileBytes, contentType, Path.GetFileName(orderFile.FilePath));
    }
    // DELETE: api/orders/{orderId}/delete-file/{fileId}
    [Authorize]
    [HttpDelete("{orderId}/delete-file/{fileId}")]
    public async Task<IActionResult> DeleteOrderFile(int orderId, int fileId)
    {
        var orderFile = await _context.OrderFiles
                                      .FirstOrDefaultAsync(of => of.OrderID == orderId && of.OrderFileID == fileId);

        if (orderFile == null)
        {
            return NotFound("File non trovato.");
        }

        var filePath = Path.Combine("wwwroot", orderFile.FilePath.TrimStart('/'));

        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }

        _context.OrderFiles.Remove(orderFile);
        await _context.SaveChangesAsync();

        return Ok(new {message = "File eliminato con successo." });
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
            ClientID = parsedClientId, 
            FreelancerID = service.UserID, 
            OrderDate = DateTime.UtcNow,
            Status = "Pending",
            TotalPrice = orderDto.TotalPrice,
            PaymentStatus = "Pending",  
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
      

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
           
            return BadRequest("User ID is missing.");
        }

        int parsedUserId;
        if (!int.TryParse(userId, out parsedUserId))
        {
           
            return BadRequest("Invalid User ID.");
        }

 
        try
        {
            var stats = await GetMonthlyOrderStats(parsedUserId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            // Log: eccezione durante il recupero delle statistiche
            return StatusCode(500, "An error occurred while retrieving order stats.");
        }
    }



    private async Task<OrderStatsDto> GetMonthlyOrderStats(int userId)
    {

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
        }
        else
        {
        }

        return new OrderStatsDto
        {
            Months = orderStats.Select(s => s.Month).ToArray(),
            Earnings = orderStats.Select(s => s.TotalEarnings).ToArray(),
            OrdersCount = orderStats.Select(s => s.OrderCount).ToArray()
        };
    }


    [HttpPost("{orderId}/complete")]
    public async Task<IActionResult> CompleteOrder(int orderId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
        {
            return NotFound();
        }

        order.Status = "Completed";
        await _context.SaveChangesAsync();

        var clientId = order.ClientID.ToString();

        var notificationHubContext = (IHubContext<NotificationHub>)HttpContext.RequestServices.GetService(typeof(IHubContext<NotificationHub>));
        await notificationHubContext.Clients.User(clientId).SendAsync("ReceiveNotification", $"Il tuo ordine #{orderId} è stato completato!");


        return Ok(order);
    }





    private bool OrderExists(int id)
    {
        return _context.Orders.Any(e => e.OrderID == id);
    }
}
