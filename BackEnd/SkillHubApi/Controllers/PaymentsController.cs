using Stripe;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using SkillHubApi.Models;
using Stripe.Checkout;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Collections.Generic;
using Microsoft.Extensions.Logging; // Importa ILogger

[Route("api/[controller]")]
[ApiController]
public class PaymentsController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly string _secretKey;
    private readonly SkillHubContext _context;
    private readonly ILogger<PaymentsController> _logger; // Aggiungi ILogger

    public PaymentsController(IConfiguration configuration, SkillHubContext context, ILogger<PaymentsController> logger)
    {
        _secretKey = configuration["Stripe:SecretKey"];
        StripeConfiguration.ApiKey = _secretKey;
        _context = context;
        _logger = logger; // Inizializza ILogger
    }

    [HttpPost("create-checkout-session")]
    public async Task<IActionResult> CreateCheckoutSession([FromBody] Order order)
    {
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = (long)(order.TotalPrice * 100), // In cents
                        Currency = "usd",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = "Order Payment",
                        },
                    },
                    Quantity = 1,
                },
            },
            Mode = "payment",
            SuccessUrl = "http://localhost:4200/home",
            CancelUrl = "http://localhost:4200/home",
            Metadata = new Dictionary<string, string>
            {
                { "order_id", order.OrderID.ToString() }
            }
        };

        var service = new SessionService();
        Session session = await service.CreateAsync(options);

        // Log la creazione della sessione
        _logger.LogInformation($"Checkout session created: {session.Id}");

        // Salva l'ID della sessione Stripe nell'ordine
        order.StripeSessionID = session.Id;
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();

        return Ok(new { sessionId = session.Id });
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

        try
        {
            _logger.LogInformation("Webhook received.");

            var stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                _configuration["Stripe:WebhookSecret"]
            );

            _logger.LogInformation($"Stripe event type: {stripeEvent.Type}");

            if (stripeEvent.Type == Events.CheckoutSessionCompleted)
            {
                var session = stripeEvent.Data.Object as Session;
                _logger.LogInformation($"Checkout session completed for session ID: {session.Id}");

                // Recupera il PaymentIntent usando il PaymentIntentId
                var paymentIntentId = session.PaymentIntentId;
                _logger.LogInformation($"PaymentIntent ID: {paymentIntentId}");

                // Usa ChargeService per ottenere i dettagli del Charge associato al PaymentIntent
                var chargeService = new ChargeService();
                var charges = chargeService.List(new ChargeListOptions
                {
                    PaymentIntent = paymentIntentId
                });

                var charge = charges.Data.First();
                var chargeId = charge.Id;
                var amountPaid = charge.Amount / 100M;

                _logger.LogInformation($"Charge ID: {chargeId}, Amount Paid: {amountPaid}");

                // Recupera l'ID dell'ordine dai metadata
                var orderId = session.Metadata["order_id"];
                int orderIdInt = int.Parse(orderId);

                _logger.LogInformation($"Order ID from metadata: {orderIdInt}");

                // Stato aggiornato
                var paymentStatus = "Paid";
                var stripePaymentId = session.PaymentIntentId;

                // Aggiorna lo stato dell'ordine nel database
                await UpdateOrderStatus(orderIdInt, paymentStatus, stripePaymentId, amountPaid);
                _logger.LogInformation($"Order {orderIdInt} updated with payment status {paymentStatus} and amount {amountPaid}");
            }

            return Ok();
        }
        catch (StripeException e)
        {
            _logger.LogError($"Stripe Exception: {e.Message}");
            return BadRequest();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error processing Stripe webhook: {ex.Message}");
            return BadRequest();
        }
    }

    private async Task UpdateOrderStatus(int orderId, string paymentStatus, string stripePaymentId, decimal amountPaid)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderID == orderId);
        if (order != null)
        {
            order.PaymentStatus = paymentStatus;
            order.StripePaymentID = stripePaymentId;
            order.TotalPrice = amountPaid;

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Order {orderId} updated in the database.");
        }
        else
        {
            _logger.LogWarning($"Order {orderId} not found in the database.");
        }
    }
}
