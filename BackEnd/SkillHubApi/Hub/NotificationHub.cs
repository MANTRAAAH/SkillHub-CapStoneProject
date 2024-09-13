using Microsoft.AspNetCore.SignalR;

    public class NotificationHub : Hub
    {
        // Metodo per inviare notifiche agli utenti
        public async Task SendNotification(string userId, string message)
        {
            await Clients.User(userId).SendAsync("ReceiveNotification", message);
        }
    }
