using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SkillHubApi.Models;

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
        // Verifica che SenderID e ReceiverID siano stati forniti
        if (message.SenderID == 0 || message.ReceiverID == 0)
        {
            return BadRequest("SenderID and ReceiverID are required.");
        }

        // Recupera il Sender dal database
        var sender = await _context.Users.FindAsync(message.SenderID);
        if (sender == null)
        {
            return NotFound($"Sender with ID {message.SenderID} not found.");
        }

        // Recupera il Receiver dal database
        var receiver = await _context.Users.FindAsync(message.ReceiverID);
        if (receiver == null)
        {
            return NotFound($"Receiver with ID {message.ReceiverID} not found.");
        }

        // Associa Sender e Receiver al messaggio
        message.Sender = sender;
        message.Receiver = receiver;

        // Aggiungi il messaggio al database
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        // Invia il messaggio in tempo reale tramite SignalR
        await _hubContext.Clients.User(message.ReceiverID.ToString()).SendAsync("ReceiveMessage", message);

        return CreatedAtAction(nameof(GetChatHistory), new { userId1 = message.SenderID, userId2 = message.ReceiverID }, message);
    }

    // GET: api/chat/history/{userId1}/{userId2}
    [HttpGet("history/{userId1}/{userId2}")]
    public async Task<ActionResult<IEnumerable<Message>>> GetChatHistory(int userId1, int userId2)
    {
        var messages = await _context.Messages
            .Where(m => (m.SenderID == userId1 && m.ReceiverID == userId2) ||
                        (m.SenderID == userId2 && m.ReceiverID == userId1))
            .OrderBy(m => m.SentDate)
            .ToListAsync();

        return Ok(messages);
    }
}
