namespace SkillHubApi.Models
{
    public class Order
    {
        public int OrderID { get; set; }
        public int ServiceID { get; set; } // Foreign Key
        public int ClientID { get; set; } // Foreign Key
        public int FreelancerID { get; set; } // Foreign Key
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } // Pending, In Progress, Completed, Cancelled
        public decimal TotalPrice { get; set; }
        public string PaymentStatus { get; set; } // Pending, Paid, Failed
        public string StripePaymentID { get; set; }

        // Navigation Properties
        public Service Service { get; set; }
        public User Client { get; set; }
        public User Freelancer { get; set; }

        public Review? Review { get; set; }
        public ICollection<Review> Reviews { get; set; }
        public ICollection<Message> Messages { get; set; }
    }

}
