using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SkillHubApi.Models;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
public class ChatController : ControllerBase
{
    private readonly SkillHubContext _context;
    private readonly IHubContext<ChatHub> _hubContext;

    public ChatController(SkillHubContext context, IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    // POST: api/chat/send
    [HttpPost("send")]
    public async Task<ActionResult<Message>> SendMessage([FromBody] Message message)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (message.SenderId == 0 || message.ReceiverId == 0)
        {
            return BadRequest("SenderId and ReceiverId are required.");
        }

        var sender = await _context.Users.FindAsync(message.SenderId);
        if (sender == null)
        {
            return NotFound($"Sender with ID {message.SenderId} not found.");
        }

        var receiver = await _context.Users.FindAsync(message.ReceiverId);
        if (receiver == null)
        {
            return NotFound($"Receiver with ID {message.ReceiverId} not found.");
        }

        message.Sender = sender;
        message.Receiver = receiver;

        message.SentDate = DateTime.UtcNow.AddSeconds(-DateTime.UtcNow.Second);
        message.Timestamp = DateTime.UtcNow.AddSeconds(-DateTime.UtcNow.Second);

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        try
        {
            await _hubContext.Clients.User(message.ReceiverId.ToString()).SendAsync("ReceiveMessage", message);
        }
        catch (Exception ex)
        {
        }

        return CreatedAtAction(nameof(GetChatHistory), new { userId1 = message.SenderId, userId2 = message.ReceiverId }, message);
    }

    // GET: api/chat/get-messages/{userId}
    [HttpGet("get-messages/{userId}")]
    public async Task<IActionResult> GetMessages(int userId)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        var messages = await _context.Messages
            .Where(m => (m.SenderId == currentUserId && m.ReceiverId == userId) ||
                        (m.SenderId == userId && m.ReceiverId == currentUserId))
            .OrderBy(m => m.Timestamp)
            .ToListAsync();

        return Ok(messages);
    }



    [HttpGet("get-chatted-users")]
    public async Task<IActionResult> GetChattedUsers()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        var chattedUsers = await _context.Users
            .Where(u => _context.Messages
                .Any(m => (m.SenderId == userId && m.ReceiverId == u.UserID) || (m.ReceiverId == userId && m.SenderId == u.UserID)))
            .ToListAsync();

        return Ok(chattedUsers);
    }
    // GET: api/chat/history/{userId1}/{userId2}
    [HttpGet("history/{userId1}/{userId2}")]
    public async Task<ActionResult<IEnumerable<Message>>> GetChatHistory(int userId1, int userId2)
    {
        var messages = await _context.Messages
            .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2) ||
                        (m.SenderId == userId2 && m.ReceiverId == userId1))
            .OrderBy(m => m.Timestamp)
            .ToListAsync();

        return Ok(messages);
    }
}
