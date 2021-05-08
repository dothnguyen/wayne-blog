using System.Collections.Generic;
using System.Threading.Tasks;
using wayne_blog_api.Common;
using wayne_blog_api.Dtos;
using wayne_blog_api.Models;
using wayne_blog_api.Pagination;

namespace wayne_blog_api.Services
{
    public interface IPostService
    {
        // get Post of a page
         Task<ServiceResult<PagedResult<PostDto>>> GetPosts(PageParam pageParam, string searchTerm, List<string> tags, bool? publishedOnly);

        Task<ServiceResult<PostDto>> GetPost(int id);

        Task<ServiceResult<List<string>>> GetTags();

        Task<ServiceResult<List<TagCount>>> GetTagCounts();

        // add a post
         Task<ServiceResult<int>> AddPost(SavePostDto postDto);

        // update a post
        Task<ServiceResult<int>> UpdatePost(SavePostDto postDto);

        // remove a post
         Task<ServiceResult<bool>> RemovePost(int id);
    }
}