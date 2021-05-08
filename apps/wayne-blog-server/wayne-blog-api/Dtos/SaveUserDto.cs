using System.ComponentModel.DataAnnotations;

namespace wayne_blog_api.Dtos
{
    public class SaveUserDto
    {
        public string Id { get; set; }

        [Required]
        public string UserName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        public string AvatarURL { get; set; }
    }
}