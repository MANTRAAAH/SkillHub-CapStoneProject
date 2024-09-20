namespace SkillHubApi.Models
{
    public class Service
    {
        public int ServiceID { get; set; }
        public int UserID { get; set; }
        public int CategoryID { get; set; }
        public int SubCategoryID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? ImagePath { get; set; } 

        public virtual User? User { get; set; }
        public virtual Category? Category { get; set; }
        public virtual SubCategory? SubCategory { get; set; }
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
