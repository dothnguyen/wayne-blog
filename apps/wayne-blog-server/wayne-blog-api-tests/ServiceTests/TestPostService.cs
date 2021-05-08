using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using wayne_blog_api;
using wayne_blog_api.Common;
using wayne_blog_api.Db;
using wayne_blog_api.Dtos;
using wayne_blog_api.Models;
using wayne_blog_api.Services;
using wayne_blog_api.Services.Impl;
using Xunit;

namespace wayne_blog_api_tests
{

    public class TestPostService: BaseTestClass
    {
        

        public TestPostService(): base()
        {
            
        }

        private async void AddPost(PostServiceImpl _postService, int id, List<string> tags) {

            var post = new SavePostDto()
            {
                Id = id,
                UserId = "1234567890",
                Title = "This is post title",
                Content = "This is post content",
                Publish = 1,
                PublishDate = DateTime.Now,
                Tags = tags
            };

            var result = await _postService.AddPost(post);

            Assert.Equal(ResultCode.OK, result.Code);
        }

        [Fact]
        public async void TestAddPost() {

            using(var DataContext = this.GetDBContext()) {
                var _postService = new PostServiceImpl(DataContext, this.mapper);

                var post = new SavePostDto()
                {
                    Id = 99,
                    UserId = "1234567890",
                    Title = "This is post title",
                    Content = "This is post content",
                    Publish = 1,
                    PublishDate = DateTime.Now,
                    Tags = new List<string>() { "TestAddPost First Tag", "TestAddPost Second Tag", "TestAddPost Third Tag" }
                };

                var result = await _postService.AddPost(post);

                Assert.Empty(result.Errors);
                Assert.Equal(ResultCode.OK, result.Code);

                int postId = result.Result;

                Assert.True(postId > 0);

                var postE = DataContext.Posts.Find(postId);

                Assert.NotNull(postE);
                Assert.NotEmpty(postE.PostTags);
                Assert.Equal(3, postE.PostTags.Count);

                Assert.Equal("TestAddPost First Tag", postE.PostTags.ElementAt(0).Tag.Value);
            }

            
        }

        [Fact]
        public async void TestUpdatePost() {

            var postId = 100;

            using (var DataContext = this.GetDBContext())
            {
                var _postService = new PostServiceImpl(DataContext, this.mapper);
                this.AddPost(_postService, postId, new List<string>() { "TestUpdatePost First Tag", "TestUpdatePost Second Tag", "TestUpdatePost New Tag" });
            }

            using (var DataContext = this.GetDBContext()){

                var _postService = new PostServiceImpl(DataContext, this.mapper);

                var post = new SavePostDto();
                post.Id = postId;
                post.Title = "This is updated title";
                post.Tags = new List<string>() { "TestUpdatePost First Tag1", "TestUpdatePost Second Tag", "TestUpdatePost New Tag" };

                var result = await _postService.UpdatePost(post);

                Assert.Empty(result.Errors);
                Assert.Equal(result.Code, ResultCode.OK);

                var postE = DataContext.Posts.Find(postId);

                Assert.NotNull(postE);
                Assert.Equal("This is updated title", postE.Title);
                Assert.NotEmpty(postE.PostTags);
                Assert.Equal(3, postE.PostTags.Count);

                var notExist = postE.PostTags.ToList().Any(pt => pt.Tag.Value == "TestUpdatePost Third Tag");
                Assert.False(notExist);

                var exist = postE.PostTags.ToList().Any(pt => pt.Tag.Value == "TestUpdatePost New Tag");
                Assert.True(exist);
            }
        }

        [Fact]
        public async void TestUpdatePostClearTags() {
            using (var DataContext = this.GetDBContext())
            {
                var _postService = new PostServiceImpl(DataContext, this.mapper);
                var postId = 101;

                this.AddPost(_postService, postId, new List<string>() { "TestUpdatePostClearTags First Tag", "TestUpdatePostClearTags Second Tag", "TestUpdatePostClearTags New Tag" });

                var post = new SavePostDto();
                post.Id = postId;
                post.Title = "This is updated title";
                post.Tags = new List<string>() { };

                var result = await _postService.UpdatePost(post);

                Assert.Empty(result.Errors);
                Assert.Equal(ResultCode.OK, result.Code);

                var postE = DataContext.Posts.Find(postId);

                Assert.NotNull(postE);
                Assert.Equal("This is updated title", postE.Title);
                Assert.Empty(postE.PostTags);
            }
        }

        [Fact]
        public async void TestDeletePost()
        {
            using (var DataContext = this.GetDBContext())
            {
                var _postService = new PostServiceImpl(DataContext, this.mapper);
                var postId = 102;

                this.AddPost(_postService, postId, new List<string>() { "TestDeletePost First Tag", "TestDeletePost Second Tag", "TestDeletePost New Tag" });

                var result = await _postService.RemovePost(postId);

                Assert.Empty(result.Errors);
                Assert.Equal(ResultCode.OK, result.Code);

                var postE = DataContext.Posts.Find(postId);

                Assert.Null(postE);

                var postTags = DataContext.PostTags.Where(pt => pt.PostId == postId).ToList();
                Assert.Empty(postTags);
            }
        }

        [Fact]
        public async void TestDeleteNonExistPost()
        {
            using (var DataContext = this.GetDBContext())
            {
                var _postService = new PostServiceImpl(DataContext, this.mapper);
                var postId = 103;

                var result = await _postService.RemovePost(postId);

                Assert.NotEmpty(result.Errors);
                Assert.Equal(ResultCode.ERROR, result.Code);
            }
        }
    }
}
