namespace SkillHubApi.Models
{
    public class OrderDto
    {
        public int ServiceID { get; set; }  
        public int ClientID { get; set; }  
        public decimal TotalPrice { get; set; }  

       
        public string StripePaymentID { get; set; } = "";  
    }
}
