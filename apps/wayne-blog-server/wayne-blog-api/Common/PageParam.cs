namespace wayne_blog_api.Common
{
    public class PageParam
    {
        public int page { get; set; }
        public int pageSize { get; set; }
        public string sort { get; set; }
        public int? order { get; set; }
    }
}