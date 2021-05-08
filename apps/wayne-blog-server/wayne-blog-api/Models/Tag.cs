using System.Collections.Generic;

namespace wayne_blog_api.Models
{
    public class Tag
    {
        public int Id { get; set; }
        public string Value { get; set; }

        public virtual ICollection<PostTag> PostTags { get; set; }
    }
}