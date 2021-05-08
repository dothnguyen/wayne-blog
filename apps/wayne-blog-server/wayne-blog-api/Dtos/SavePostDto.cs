using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace wayne_blog_api.Dtos
{
    public class SavePostDto
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        [Required]
        public int Publish { get; set; }

        [Required]
        public string UserId { get; set; }

        public DateTime? PublishDate { get; set; }
        
        public List<string> Tags { get; set; }
    }
}