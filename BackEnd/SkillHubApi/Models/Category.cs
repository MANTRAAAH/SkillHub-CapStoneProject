namespace SkillHubApi.Models
{
    public class Category
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; }

        public virtual ICollection<Service> Services { get; set; } = new List<Service>();

        public virtual ICollection<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
    }


}
