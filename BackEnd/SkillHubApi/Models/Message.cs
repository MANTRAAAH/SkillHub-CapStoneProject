using System.ComponentModel.DataAnnotations.Schema;

namespace SkillHubApi.Models
{
    public class Message
    {
        public int MessageID { get; set; }
        public int SenderID { get; set; } // Foreign Key to User (Sender)
        public int ReceiverID { get; set; } // Foreign Key to User (Receiver)
        public int? OrderID { get; set; } // Foreign Key (optional)
        public string Content { get; set; } // Questo campo sarà criptato
        public DateTime SentDate { get; set; }

        // Navigation Properties
        public User Sender { get; set; } // Riferimento al mittente
        public User Receiver { get; set; } // Riferimento al destinatario
        public Order Order { get; set; }
    }


}
