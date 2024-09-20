using Stripe;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using SkillHubApi.Models;
using Stripe.Checkout;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Collections.Generic;
using Microsoft.Extensions.Logging; 

[Route("api/[controller]")]
[ApiController]
public class PaymentsController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly string _secretKey;
    private readonly SkillHubContext _context;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(IConfiguration configuration, SkillHubContext context, ILogger<PaymentsController> logger)
    {
        _secretKey = configuration["Stripe:SecretKey"];
        StripeConfiguration.ApiKey = _secretKey;
        _context = context;
        _logger = logger;
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    [HttpPost("create-checkout-session")]
    public async Task<IActionResult> CreateCheckoutSession([FromBody] Order order)
    {
        if (order == null || order.TotalPrice <= 0)
        {
            return BadRequest("Invalid order.");
        }

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
    },
            PaymentIntentData = new SessionPaymentIntentDataOptions
            {
                Metadata = new Dictionary<string, string>
        {
            { "order_id", order.OrderID.ToString() }  
        }
            }
        };
        var service = new SessionService();
        Session session;
        try
        {
            session = await service.CreateAsync(options);
        }
        catch (Exception ex)
        {
            return BadRequest("Failed to create checkout session.");
        }


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

            var signatureHeader = Request.Headers["Stripe-Signature"];
            if (string.IsNullOrEmpty(signatureHeader))
            {
                return BadRequest("Stripe signature not found.");
            }


            // Verifica che il Webhook Secret sia configurato
            var webhookSecret = _configuration["Stripe:WebhookSecret"];
            if (string.IsNullOrEmpty(webhookSecret))
            {
                return BadRequest("Webhook secret not configured.");
            }


            // Verifica il Webhook usando Stripe's EventUtility
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                signatureHeader,
                webhookSecret
            );


            // Gestisci l'evento di pagamento riuscito
            if (stripeEvent.Type == Events.CheckoutSessionCompleted)
            {
                var session = stripeEvent.Data.Object as Session;

                var paymentIntentId = session?.PaymentIntentId;

                // Recupera l'ID dell'ordine dai metadata
                if (session?.Metadata.ContainsKey("order_id") == true)
                {
                    var orderId = session.Metadata["order_id"];
                    if (int.TryParse(orderId, out var orderIdInt))
                    {

                        // Ottieni i dettagli del Charge
                        var chargeService = new ChargeService();
                        var charges = chargeService.List(new ChargeListOptions
                        {
                            PaymentIntent = paymentIntentId
                        });

                        if (charges.Data != null && charges.Data.Any())
                        {
                            var charge = charges.Data.First();
                            var amountPaid = charge.Amount / 100M;


                            // Aggiorna lo stato dell'ordine nel database come pagato
                            await UpdateOrderStatus(orderIdInt, "Paid", paymentIntentId, amountPaid);
                        }
                        else
                        {
                        }
                    }
                    else
                    {
                    }
                }
                else
                {
                }
            }
            // Gestisci l'evento di pagamento fallito
            else if (stripeEvent.Type == Events.PaymentIntentPaymentFailed)
            {
                var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                var paymentIntentId = paymentIntent?.Id;

                // Recupera l'ID dell'ordine dai metadata del PaymentIntent
                if (paymentIntent?.Metadata.ContainsKey("order_id") == true)
                {
                    var orderId = paymentIntent.Metadata["order_id"];
                    if (int.TryParse(orderId, out var orderIdInt))
                    {

                        // Aggiorna lo stato dell'ordine nel database come fallito
                        await UpdateOrderStatus(orderIdInt, "Failed", paymentIntentId, 0); // Importo zero poiché fallito
                    }
                    else
                    {
                    }
                }
                else
                {
                }
            }
            return Ok();
        }
        catch (StripeException e)
        {
            return BadRequest();
        }
        catch (Exception ex)
        {
            return BadRequest();
        }
    }

    private async Task UpdateOrderStatus(int orderId, string paymentStatus, string stripePaymentId, decimal amountPaid)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderID == orderId);
        if (order != null)
        {
            // Aggiorna lo stato del pagamento e il PaymentIntent ID
            order.PaymentStatus = paymentStatus;
            order.StripePaymentID = stripePaymentId;

            if (paymentStatus == "Paid")
            {
                order.TotalPrice = amountPaid;
            }

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();

        }
        else
        {
        }
    }
}
