namespace SkillHubApi.Models
{
    public class SubCategory
    {
        public int SubCategoryID { get; set; }
        public string SubCategoryName { get; set; }

        public int CategoryID { get; set; } // Chiave esterna
        public virtual Category? Category { get; set; } // Proprietà di navigazione

        // Collezione di servizi - opzionale
        public virtual ICollection<Service> Services { get; set; } = new List<Service>();
    }


}
