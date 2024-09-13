namespace SkillHubApi.Models
{
    public class OrderFile
    {
        public int OrderFileID { get; set; }
        public int OrderID { get; set; }
        public string FilePath { get; set; } = string.Empty; // Percorso del file

        // Navigazione verso l'ordine
        public Order Order { get; set; }
    }

}
