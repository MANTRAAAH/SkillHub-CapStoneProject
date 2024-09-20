namespace SkillHubApi.Models
{
    public class OrderDetailsDto
    {
        public int OrderID { get; set; }
        public string ServiceTitle { get; set; } 
        public string ClientUsername { get; set; }  
        public string FreelancerUsername { get; set; } 
        public DateTime OrderDate { get; set; }  
        public string Status { get; set; }  
        public string PaymentStatus { get; set; }  
        public decimal TotalPrice { get; set; } 

       
        public List<OrderFileDto> OrderFiles { get; set; }  
    }
}
