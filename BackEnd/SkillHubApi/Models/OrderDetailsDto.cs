﻿namespace SkillHubApi.Models
{
    public class OrderDetailsDto
    {
        public int OrderID { get; set; }
        public string ServiceTitle { get; set; }  // Titolo del servizio
        public string ClientUsername { get; set; }  // Username del cliente
        public string FreelancerUsername { get; set; }  // Username del freelancer
        public DateTime OrderDate { get; set; }  // Data dell'ordine
        public string PaymentStatus { get; set; }  // Stato dell'ordine
        public decimal TotalPrice { get; set; }  // Prezzo totale
    }
}
