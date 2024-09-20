namespace SkillHubApi.Models
{
    public class Review
    {
        public int ReviewID { get; set; }
        public int UserID { get; set; }
        public int OrderID { get; set; } 
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime ReviewDate { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
        public Order Order { get; set; } 
    }


}
