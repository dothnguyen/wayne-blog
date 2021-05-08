using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace wayne_blog_api.Dtos
{
    public class PostDto
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string Content { get; set; }

        public int Publish { get; set; }

        public string UserId { get; set; }

        public DateTime? PublishDate { get; set; }
        
        public List<string> Tags { get; set; }

        public DateTime? LastUpdatedDate { get; set; }

        public string UserName {get; set;}

        public string AvatarUrl {get; set;}

        public bool IsPublish {
            get {
                return Publish == 1 || (Publish == 2 && PublishDate.Value <= DateTime.UtcNow);
            }
        }
    }
}