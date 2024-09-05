namespace SkillHubApi.Models
{
    public class Order
    {
        public int OrderID { get; set; }
        public int ServiceID { get; set; } // Foreign Key
        public int ClientID { get; set; } // Foreign Key
        public int FreelancerID { get; set; } // Foreign Key
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, In Progress, Completed, Cancelled
        public decimal TotalPrice { get; set; }
        public string PaymentStatus { get; set; } = "Pending"; // Pending, Paid, Failed
        public string StripePaymentID { get; set; } = "";
        public string StripeSessionID { get; set; } = ""; // Aggiunto per gestire il Checkout Session ID di Stripe

        // Navigation Properties
        public Service? Service { get; set; }
        public User? Client { get; set; }
        public User? Freelancer { get; set; }

        public Review? Review { get; set; }
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}
