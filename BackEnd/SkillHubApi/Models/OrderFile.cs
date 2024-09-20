namespace SkillHubApi.Models
{
    public class OrderFile
    {
        public int OrderFileID { get; set; }
        public int OrderID { get; set; }
        public string FilePath { get; set; } = string.Empty; 

        public Order Order { get; set; }
    }

}
