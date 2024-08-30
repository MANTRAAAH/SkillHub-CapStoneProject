using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;
using SkillHubApi.Models;

public class ChatHub : Hub
{
    private static readonly ConcurrentDictionary<string, string> _userConnections = new ConcurrentDictionary<string, string>();
    private readonly SkillHubContext _context;

    public ChatHub(SkillHubContext context)
    {
        _context = context;
    }

    // Metodo chiamato dai client per inviare un messaggio
    public async Task SendMessage(string receiverUserId, string messageContent)
    {
        if (string.IsNullOrEmpty(receiverUserId))
        {
            // Gestisci il caso di userId nullo
            await Clients.Caller.SendAsync("ReceiveMessage", "System", "Invalid receiver user ID.");
            return;
        }

        var senderUserId = Context.UserIdentifier;

        if (string.IsNullOrEmpty(senderUserId))
        {
            // Gestisci il caso di senderUserId nullo
            await Clients.Caller.SendAsync("ReceiveMessage", "System", "Invalid sender user ID.");
            return;
        }

        try
        {
            var receiverIdInt = int.Parse(receiverUserId);
            var senderIdInt = int.Parse(senderUserId);

            // Salva il messaggio nel database
            var message = new Message
            {
                SenderID = senderIdInt,
                ReceiverID = receiverIdInt,
                Content = messageContent,
                SentDate = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Ottieni il ConnectionId dell'utente destinatario
            if (_userConnections.TryGetValue(receiverUserId, out string receiverConnectionId))
            {
                // Invia il messaggio solo al destinatario
                await Clients.Client(receiverConnectionId).SendAsync("ReceiveMessage", senderUserId, messageContent);
            }
            else
            {
                // Notifica al mittente che il destinatario non è online
                await Clients.Caller.SendAsync("ReceiveMessage", "System", "User is not available. The message has been saved.");
            }
        }
        catch (Exception ex)
        {
            // Logga l'errore per ulteriore diagnosi
            Console.WriteLine($"Error in SendMessage: {ex.Message}");
            throw;
        }
    }


    // Metodo chiamato quando un client si collega
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;

        if (!string.IsNullOrEmpty(userId))
        {
            // Aggiungi o aggiorna la mappatura UserId -> ConnectionId
            _userConnections.AddOrUpdate(userId, Context.ConnectionId, (key, oldValue) => Context.ConnectionId);

            // Recupera i messaggi non letti dal database
            var unreadMessages = _context.Messages
                .Where(m => m.ReceiverID == int.Parse(userId) && !m.IsRead)
                .OrderBy(m => m.SentDate)
                .ToList();

            // Invia i messaggi non letti al client appena connesso
            foreach (var message in unreadMessages)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", message.SenderID.ToString(), message.Content);
                message.IsRead = true;  // Marca il messaggio come letto
            }

            await _context.SaveChangesAsync();

            // Notifica al client che è connesso
            await Clients.Caller.SendAsync("ReceiveMessage", "System", "You are connected.");
        }

        await base.OnConnectedAsync();
    }

    // Metodo chiamato quando un client si disconnette
    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var userId = Context.UserIdentifier;

        if (!string.IsNullOrEmpty(userId))
        {
            // Rimuovi la mappatura quando l'utente si disconnette
            _userConnections.TryRemove(userId, out _);

            // Potresti voler notificare altri utenti che questo utente è offline
            await Clients.All.SendAsync("ReceiveMessage", "System", $"{userId} has disconnected.");
        }

        await base.OnDisconnectedAsync(exception);
    }

    // Metodo per ottenere il ConnectionId per un dato UserId
    private string GetConnectionIdForUser(string userId)
    {
        _userConnections.TryGetValue(userId, out string connectionId);
        return connectionId;
    }
}
