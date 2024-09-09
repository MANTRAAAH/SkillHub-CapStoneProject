using SkillHubApi.Models;

public class Message
{
    public int MessageID { get; set; }
    public int SenderId { get; set; }  // Corretto per usare SenderId
    public User? Sender { get; set; }
    public int ReceiverId { get; set; }  // Corretto per usare ReceiverId
    public User? Receiver { get; set; }
    public string Content { get; set; }
    public DateTime Timestamp { get; set; }  // Esiste come Timestamp

    // Aggiungi le seguenti proprietà che mancano
    public bool IsRead { get; set; }  // Aggiungi IsRead se stai gestendo lo stato di lettura del messaggio
    public DateTime SentDate { get; set; }  // Se stai gestendo la data di invio separatamente da Timestamp
}


