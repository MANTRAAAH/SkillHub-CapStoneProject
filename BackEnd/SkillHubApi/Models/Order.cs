namespace SkillHubApi.Models
{
    public class Order
    {
        public int OrderID { get; set; }
        public int ServiceID { get; set; } 
        public int ClientID { get; set; } 
        public int FreelancerID { get; set; } 
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = "Pending"; 
        public decimal TotalPrice { get; set; }
        public string PaymentStatus { get; set; } = "Pending"; 
        public string StripePaymentID { get; set; } = "";
        public string StripeSessionID { get; set; } = ""; 


        public Service? Service { get; set; }
        public User? Client { get; set; }
        public User? Freelancer { get; set; }

        public Review? Review { get; set; }
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
        public ICollection<OrderFile>? Files { get; set; } = new List<OrderFile>(); 
    }
}
