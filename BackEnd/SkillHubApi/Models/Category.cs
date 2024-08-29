namespace SkillHubApi.Models
{
    public class Category
    {
        public int CategoryID { get; set; }
        public string CategoryName { get; set; }

        // Collezione di servizi - opzionale
        public virtual ICollection<Service> Services { get; set; } = new List<Service>();

        // Collezione di sottocategorie - opzionale
        public virtual ICollection<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
    }


}
