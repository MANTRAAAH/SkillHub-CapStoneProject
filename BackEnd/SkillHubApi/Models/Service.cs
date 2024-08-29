using System;
using System.Collections.Generic;

namespace SkillHubApi.Models
{
    public class Service
    {
        public int ServiceID { get; set; }

        // Foreign Keys
        public int UserID { get; set; }
        public int CategoryID { get; set; }
        public int SubCategoryID { get; set; }

        // Properties
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual User? User { get; set; }
        public virtual Category? Category { get; set; }
        public virtual SubCategory? SubCategory { get; set; }
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
