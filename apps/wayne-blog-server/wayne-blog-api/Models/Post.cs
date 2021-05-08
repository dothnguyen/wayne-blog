using System;
using System.Collections.Generic;

namespace wayne_blog_api.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int Publish { get; set; }
        public DateTime? PublishDate { get; set; }

        public DateTime? CreatedDate { get; set; }

        public DateTime? LastUpdatedDate { get; set; }

        public User User {get; set;}

        public virtual ICollection<PostTag> PostTags { get; set; }
    }
}