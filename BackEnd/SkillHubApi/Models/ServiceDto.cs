namespace SkillHubApi.Models
{
    public class ServiceDto
    {
        public int ServiceID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string CategoryName { get; set; }
        public string SubCategoryName { get; set; }
        public string UserName { get; set; }
    }

}
