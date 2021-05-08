using System.Collections.Generic;

namespace wayne_blog_api.Models
{
    public class User
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string AvatarURL { get; set; }

        public virtual ICollection<Post> Posts { get; set; }
    }
}