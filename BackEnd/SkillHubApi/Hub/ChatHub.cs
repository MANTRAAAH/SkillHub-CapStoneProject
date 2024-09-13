using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;
using SkillHubApi.Models;

public class ChatHub : Hub
{
    // Dizionario per tracciare le connessioni attive degli utenti
    private static readonly ConcurrentDictionary<string, string> _userConnections = new ConcurrentDictionary<string, string>();
    private readonly SkillHubContext _context;

    public ChatHub(SkillHubContext context)
    {
        _context = context;
    }

    // Metodo chiamato dai client per inviare un messaggio
    public async Task SendMessage(string receiverUserId, string messageContent)
    {
        if (string.IsNullOrEmpty(receiverUserId) || string.IsNullOrEmpty(messageContent))
        {
            await Clients.Caller.SendAsync("ReceiveMessage", "System", "Receiver ID and message content are required.");
            return;
        }

        var senderUserId = Context.UserIdentifier;

        if (string.IsNullOrEmpty(senderUserId))
        {
            await Clients.Caller.SendAsync("ReceiveMessage", "System", "Sender ID is not valid.");
            return;
        }

        try
        {
            int receiverIdInt = int.Parse(receiverUserId);
            int senderIdInt = int.Parse(senderUserId);

            // Salva il messaggio nel database
            var message = new Message
            {
                SenderId = senderIdInt,
                ReceiverId = receiverIdInt,
                Content = messageContent,
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Crea il DTO da inviare al client
            var messageDto = new MessageDto
            {
                MessageId = message.MessageID,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                Content = message.Content,
                Timestamp = message.Timestamp
            };

            // Verifica se il destinatario è online
            if (_userConnections.TryGetValue(receiverUserId, out string receiverConnectionId))
            {
                // Invia il messaggio al destinatario se è online
                await Clients.Client(receiverConnectionId).SendAsync("ReceiveMessage", messageDto);
                Console.WriteLine($"Messaggio inviato a: {receiverUserId}");
            }
            else
            {
                await Clients.Caller.SendAsync("ReceiveMessage", "System", "User is not online. The message has been saved.");
                Console.WriteLine($"Destinatario {receiverUserId} non è online.");
            }

            // Log per la notifica
            Console.WriteLine($"[SERVER] Tentativo di invio notifica a: {receiverUserId}");
            await Clients.User(receiverUserId).SendAsync("ReceiveNotification", "Hai ricevuto un nuovo messaggio!");
            Console.WriteLine($"[SERVER] Notifica inviata a: {receiverUserId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Errore nell'invio del messaggio: {ex.Message}");
            await Clients.Caller.SendAsync("ReceiveMessage", "System", "An error occurred while sending the message.");
        }
    }




    // Metodo chiamato quando un client si collega
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;

        if (!string.IsNullOrEmpty(userId))
        {
            // Aggiungi o aggiorna la connessione dell'utente
            _userConnections.AddOrUpdate(userId, Context.ConnectionId, (key, oldValue) => Context.ConnectionId);

            // Recupera i messaggi non letti dal database
            var unreadMessages = _context.Messages
                .Where(m => m.ReceiverId == int.Parse(userId) && !m.IsRead)
                .OrderBy(m => m.Timestamp)
                .ToList();

            // Invia i messaggi non letti al client
            foreach (var message in unreadMessages)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", message.SenderId.ToString(), message.Content);
                message.IsRead = true;  // Marca come letto
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
            // Rimuovi la connessione dell'utente
            _userConnections.TryRemove(userId, out _);

            // Potresti voler notificare gli altri utenti che l'utente si è disconnesso
            await Clients.All.SendAsync("ReceiveMessage", "System", $"{userId} has disconnected.");
        }

        await base.OnDisconnectedAsync(exception);
    }

    // Metodo per ottenere il ConnectionId di un utente
    private string GetConnectionIdForUser(string userId)
    {
        _userConnections.TryGetValue(userId, out string connectionId);
        return connectionId;
    }
}
