namespace SkillHubApi.Models
{
    public class OrderStatsDto
    {
        public int[] Months { get; set; }
        public decimal[] Earnings { get; set; }
        public int[] OrdersCount { get; set; }
    }

}
