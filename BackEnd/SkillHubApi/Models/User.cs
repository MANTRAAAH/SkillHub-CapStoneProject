namespace SkillHubApi.Models
{
    public class User
    {
        public int UserID { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public byte[] PasswordHash { get; set; }  
        public byte[] PasswordSalt { get; set; }  
        public string Role { get; set; } = string.Empty;
        public string ProfilePicture { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public bool IsOnline { get; set; } = false;
        public DateTime? LastSeen { get; set; }
        public bool IsLastSeenPublic { get; set; } = false;

       


        public ICollection<Service> Services { get; set; } = new List<Service>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Order> ClientOrders { get; set; } = new List<Order>();
        public ICollection<Order> FreelancerOrders { get; set; } = new List<Order>();
        public ICollection<Message> SentMessages { get; set; } = new List<Message>();
        public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
    }


}
