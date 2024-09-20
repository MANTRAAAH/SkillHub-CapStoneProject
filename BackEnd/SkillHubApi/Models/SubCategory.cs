namespace SkillHubApi.Models
{
    public class SubCategory
    {
        public int SubCategoryID { get; set; }
        public string SubCategoryName { get; set; }

        public int CategoryID { get; set; } 
        public virtual Category? Category { get; set; } 

        public virtual ICollection<Service> Services { get; set; } = new List<Service>();
    }


}
