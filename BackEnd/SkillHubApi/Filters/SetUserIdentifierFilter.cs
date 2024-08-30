using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SkillHubApi.Filters
{
    public class SetUserIdentifierFilter : IHubFilter
    {
        public ValueTask<object> InvokeMethodAsync(
            HubInvocationContext invocationContext,
            Func<HubInvocationContext, ValueTask<object>> next)
        {
            if (invocationContext.Context.User != null)
            {
                var userId = invocationContext.Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                // Non assegnare a UserIdentifier, ma piuttosto assicurati che il claim sia presente.
            }

            return next(invocationContext);
        }
    }
}
