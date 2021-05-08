using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using wayne_blog_api.Common;
using wayne_blog_api.Db;
using wayne_blog_api.Dtos;
using wayne_blog_api.Models;
using wayne_blog_api.Pagination;


namespace wayne_blog_api.Services.Impl
{
    public class PostServiceImpl : IPostService
    {
        private readonly DataContext _context;

        private readonly IMapper _mapper;

        public PostServiceImpl(DataContext context, IMapper mapper)
        {
            this._context = context;
            this._mapper = mapper;
        }

        public async Task<ServiceResult<PagedResult<PostDto>>> GetPosts(PageParam pageParam, string searchTerm, List<string> tags, bool? publishedOnly)
        {
            var query = this._context.Posts.AsNoTracking();
            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(p => p.Title.Contains(searchTerm));
            }

            if (tags != null && tags.Count > 0)
            {
                query = query.Where(p => p.PostTags.Any(pt => tags.Contains(pt.Tag.Value)));
            }

            if (publishedOnly == true)
            {
                query = query.Where(p => p.Publish == 1 || (p.Publish == 2 && p.PublishDate <= DateTime.UtcNow));
            }

            query = query.SortBy(pageParam.sort, pageParam.order);

            return ServiceResult<PagedResult<PostDto>>.OK(await query.GetPagedAsync<Post, PostDto>(pageParam.page, pageParam.pageSize, this._mapper));
        }

        public async Task<ServiceResult<List<TagCount>>> GetTagCounts()
        {
            var query = (from tag in _context.Tags
                         where tag.PostTags.Count > 0
                         select new TagCount
                         {
                             Tag = tag.Value,
                             Count = tag.PostTags.Count
                         });

            var tags = await query.Take(10).OrderByDescending(t => t.Count).ToListAsync();

            return ServiceResult<List<TagCount>>.OK(tags);
        }

        public async Task<ServiceResult<PostDto>> GetPost(int id)
        {
            var post = await this._context.Posts.AsNoTracking().Where(p => p.Id == id)
                .ProjectTo<PostDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (post == null)
                return ServiceResult<PostDto>.ERROR("Post does not exist.");

            return ServiceResult<PostDto>.OK(post);
        }

        public Task<ServiceResult<bool>> RemovePost(int id)
        {
            try
            {
                this._context.BeginTransaction();

                // find & attach the updated values
                var post = this._context.Posts.Local.Where(p => p.Id == id).FirstOrDefault();

                if (post == null)
                {
                    post = new Post() { Id = id };
                    this._context.Posts.Attach(post);
                }

                this._context.Posts.Remove(post);

                var result = ServiceResult<bool>.OK(true);

                this._context.Commit();

                return Task.FromResult(result);

            }
            catch (Exception ex)
            {
                this._context.Rollback();
                return Task.FromResult(ServiceResult<bool>.ERROR(ex.Message));
            }
        }

        public async Task<ServiceResult<int>> AddPost(SavePostDto postDto)
        {
            var post = this._mapper.Map<Post>(postDto);

            try
            {
                this._context.BeginTransaction();

                post.CreatedDate = DateTime.UtcNow;
                post.LastUpdatedDate = DateTime.UtcNow;

                // add new
                this._context.Add(post);

                var postTags = new List<PostTag>();

                // add Tags & tag mapping
                if (postDto.Tags != null && postDto.Tags.Count > 0)
                {
                    var existingTags = await this._context.Tags.AsNoTracking().Where(t => postDto.Tags.Contains(t.Value)).ToListAsync();

                    postDto.Tags.ForEach(tag =>
                    {
                        var eTag = existingTags.Where(t => t.Value == tag).FirstOrDefault();
                        if (eTag == null)
                        {
                            eTag = new Tag()
                            {
                                Value = tag
                            };

                            this._context.Tags.Add(eTag);
                            this._context.SaveChanges();
                        }

                        var pTag = new PostTag()
                        {
                            Post = post,
                            Tag = eTag
                        };

                        postTags.Add(pTag);
                    });
                }

                post.PostTags = postTags;

                var result = ServiceResult<int>.OK(post.Id);

                this._context.Commit();

                return result;

            }
            catch (Exception ex)
            {
                this._context.Rollback();
                return ServiceResult<int>.ERROR(ex.Message);
            }
        }

        public Task<ServiceResult<int>> UpdatePost(SavePostDto postDto)
        {
            try
            {

                this._context.BeginTransaction();

                if (postDto.Id <= 0)
                    return Task.FromResult(ServiceResult<int>.ERROR("Can not update a post without an Id"));

                // find & attach the updated values
                var post = new Post() { Id = postDto.Id };

                // check if entity is already loaded to local context
                if (this._context.Posts.Local.Any(p => p.Id == postDto.Id))
                {
                    post = this._context.Posts.Local.Where(p => p.Id == postDto.Id).FirstOrDefault();
                }
                else
                {
                    this._context.Posts.Attach(post);
                }

                // copy the updated values
                this._mapper.Map<SavePostDto, Post>(postDto, post);

                post.LastUpdatedDate = DateTime.UtcNow;

                this._context.Entry(post).State = EntityState.Modified;
                this._context.Entry(post).Property(x => x.CreatedDate).IsModified = false;

                var postTags = new List<PostTag>();

                // add Tags & tag mapping
                if (postDto.Tags != null && postDto.Tags.Count > 0)
                {
                    // find all existing tag with mapping or not
                    var query = (from tag in this._context.Tags
                                 join pt in this._context.PostTags on tag.Id equals pt.TagId into PostTags
                                 from pt1 in PostTags.DefaultIfEmpty()
                                 where (postDto.Tags.Contains(tag.Value) && (pt1 == null || (pt1 != null && pt1.PostId == post.Id))) || (pt1 != null && pt1.PostId == post.Id)
                                 select new
                                 {
                                     tag.Id,
                                     tag.Value,
                                     PostId = (pt1 != null && pt1.PostId == post.Id) ? pt1.PostId : (int?)null
                                 });

                    var currentTags = query.ToList();

                    // remap the existing tags
                    currentTags.ForEach(t =>
                    {

                        if (t.PostId != null)
                        {
                            

                            if (!postDto.Tags.Contains(t.Value))
                            {
                                var postTag = new PostTag
                                {
                                    PostId = post.Id,
                                    TagId = t.Id,
                                };
                                this._context.PostTags.Attach(postTag);
                                this._context.PostTags.Remove(postTag);
                                this._context.SaveChanges();
                            }
                        }
                        else
                        {
                            // new mapping
                            var postTag = new PostTag
                            {
                                PostId = post.Id,
                                TagId = t.Id
                            };

                            this._context.PostTags.Add(postTag);
                            postTags.Add(postTag);
                        }


                    });

                    // the new ones => create tag then create mapping
                    var existingTagValues = currentTags.Select(t => t.Value).ToList();
                    var newTags = postDto.Tags.Where(t => !existingTagValues.Contains(t)).ToList();

                    newTags.ForEach(t =>
                    {
                        var eTag = new Tag()
                        {
                            Value = t
                        };

                        this._context.Tags.Add(eTag);

                        var pTag = new PostTag()
                        {
                            Post = post,
                            Tag = eTag
                        };

                        postTags.Add(pTag);
                    });
                }

                // update post tags
                post.PostTags = postTags;

                var result = ServiceResult<int>.OK(post.Id);

                this._context.Commit();

                return Task.FromResult(result);

            }
            catch (Exception ex)
            {
                this._context.Rollback();
                return Task.FromResult(ServiceResult<int>.ERROR(ex.Message));
            }
        }

        public async Task<ServiceResult<List<string>>> GetTags()
        {
            var tags = await this._context.Tags.Select(t => t.Value).OrderBy(t => t).ToListAsync();
            return ServiceResult<List<string>>.OK(tags);
        }
    }
}