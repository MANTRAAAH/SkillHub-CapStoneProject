using SkillHubApi.Models;

public class Message
{
    public int MessageID { get; set; }
    public int SenderId { get; set; }  
    public User? Sender { get; set; }
    public int ReceiverId { get; set; }  
    public User? Receiver { get; set; }
    public string Content { get; set; }
    public DateTime Timestamp { get; set; }  


    public bool IsRead { get; set; } 
    public DateTime SentDate { get; set; } 
}


