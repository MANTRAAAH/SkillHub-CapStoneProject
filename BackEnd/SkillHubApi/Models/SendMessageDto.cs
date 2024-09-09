using System.ComponentModel.DataAnnotations;

namespace SkillHubApi.Models
{
    public class SendMessageDto
    {
        [Required]
        public int SenderId { get; set; }

        [Required]
        public int ReceiverId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Content { get; set; }
    }

}
