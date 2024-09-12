namespace SkillHubApi.Models
{
    public class ServiceDto
    {
        public int ServiceID { get; set; }

        public int UserID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string CategoryName { get; set; }
        public string SubCategoryName { get; set; }
        public int CategoryId { get; set; }
        public int SubCategoryId { get; set; }
        public string UserName { get; set; }
    }

}
