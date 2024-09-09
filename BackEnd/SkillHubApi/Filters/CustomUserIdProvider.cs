using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace SkillHubApi.Filters
{
    public class CustomUserIdProvider : IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            // Restituisce il valore dell'ID utente basato sui claims (ad esempio, NameIdentifier)
            return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
