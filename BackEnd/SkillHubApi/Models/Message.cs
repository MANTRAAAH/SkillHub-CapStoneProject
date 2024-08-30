using SkillHubApi.Models;

public class Message
{
    public int MessageID { get; set; }
    public int SenderID { get; set; }
    public int ReceiverID { get; set; }
    public int? OrderID { get; set; }
    public string Content { get; set; }
    public DateTime SentDate { get; set; }
    public bool IsRead { get; set; }  // Campo per tracciare se il messaggio è stato letto

    public User Sender { get; set; }
    public User Receiver { get; set; }
    public Order Order { get; set; }
}
