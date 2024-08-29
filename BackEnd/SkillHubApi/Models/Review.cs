namespace SkillHubApi.Models
{
    public class Review
    {
        public int ReviewID { get; set; }
        public int UserID { get; set; }
        public int OrderID { get; set; } // Questa è la chiave esterna corretta per l'entità Order
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime ReviewDate { get; set; } = DateTime.UtcNow;

        // Proprietà di navigazione
        public User User { get; set; }
        public Order Order { get; set; } // Questa è la navigazione corretta per l'entità Order
    }


}
