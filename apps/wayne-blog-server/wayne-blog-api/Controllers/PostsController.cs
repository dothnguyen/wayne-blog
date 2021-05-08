using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using wayne_blog_api.Common;
using wayne_blog_api.Dtos;
using wayne_blog_api.Models;
using wayne_blog_api.Pagination;
using wayne_blog_api.Services;

namespace wayne_blog_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly IPostService postService;

        public PostsController(IPostService postService)
        {
            this.postService = postService;
        }

        [HttpGet]
        public async Task<ActionResult<ServiceResult<PagedResult<PostDto>>>> GetPostsPaged([FromQuery]PageParam pageParam, 
            [FromQuery]string searchTerm, [FromQuery]List<string> tags, [FromQuery] bool? publishedOnly = false) {
            
            return await this.postService.GetPosts(pageParam, searchTerm, tags, publishedOnly);
        }

        [HttpGet("getTags")]
        public async Task<ActionResult<ServiceResult<List<string>>>> GetTags()
        {
            return await this.postService.GetTags();
        }

        [HttpGet("getTagCounts")]
        public async Task<ActionResult<ServiceResult<List<TagCount>>>> getTagCounts()
        {
            return await this.postService.GetTagCounts();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceResult<PostDto>>> GetPost(int id) {
            return await this.postService.GetPost(id);
        }

        [HttpPost]
        public async Task<ActionResult<ServiceResult<int>>> AddPost(SavePostDto postDto) {
            return await this.postService.AddPost(postDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ServiceResult<int>>> UpdatePost(int id, SavePostDto postDto) {
            postDto.Id = id;
            return await this.postService.UpdatePost(postDto);
        }
    }
}