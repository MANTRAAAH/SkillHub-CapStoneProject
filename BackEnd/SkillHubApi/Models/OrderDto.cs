namespace SkillHubApi.Models
{
    public class OrderDto
    {
        public int ServiceID { get; set; }  // ID del servizio
        public int ClientID { get; set; }  // ID del cliente (utente loggato)
        public decimal TotalPrice { get; set; }  // Prezzo totale

        // Aggiungi questa proprietà se necessaria per Stripe
        public string StripePaymentID { get; set; } = "";  // ID del pagamento su Stripe
    }
}
