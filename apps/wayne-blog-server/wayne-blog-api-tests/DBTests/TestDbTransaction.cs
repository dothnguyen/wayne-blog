using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using wayne_blog_api;
using wayne_blog_api.Common;
using wayne_blog_api.Dtos;
using wayne_blog_api.Models;
using wayne_blog_api.Services;
using wayne_blog_api.Services.Impl;
using Xunit;

namespace wayne_blog_api_tests
{


    [Collection("MySqlDatabaseCollection")]
    public class TestDbTrasaction
    {

        MySqlDBFixture fixture;

        IPostService _postService;


        public TestDbTrasaction(MySqlDBFixture fixture)
        {
            this.fixture = fixture;

            var configuration = new MapperConfiguration(cfg =>
                    {
                        cfg.AddProfile(new AutoMapperProfile());
                    });

            var mapper = configuration.CreateMapper();

            this._postService = new PostServiceImpl(this.fixture.DataContext, mapper);
        }

//        [Fact]
        public async void TestCommit()
        {
            this.fixture.DataContext.BeginTransaction();

            this.fixture.DataContext.Posts.Add(new Post()
            {
                Id = 24,
                Title = "Test Commit Transaction",
                Content = "Test Commit Transaction Content"
            });

            this.fixture.DataContext.Posts.Add(new Post()
            {
                Id = 25,
                Title = "Test Commit Transaction 25",
                Content = "Test Commit Transaction 25 Content"
            });

            this.fixture.DataContext.Commit();

            var post = await this.fixture.DataContext.Posts.AsNoTracking().Where(p => p.Id == 24).FirstOrDefaultAsync();

            Assert.NotNull(post);
            Assert.Equal("Test Commit Transaction", post.Title);

            post = await this.fixture.DataContext.Posts.AsNoTracking().Where(p => p.Id == 25).FirstOrDefaultAsync();

            Assert.NotNull(post);
            Assert.Equal("Test Commit Transaction 25", post.Title);
        }

 //       [Fact]
        public async void TestRollback()
        {
            try
            {
                this.fixture.DataContext.BeginTransaction();

                this.fixture.DataContext.Posts.Add(new Post()
                {
                    Id = 26,
                    Title = "Test Commit Transaction 26",
                    Content = "Test Commit Transaction 26 Content"
                });

                this.fixture.DataContext.SaveChanges();

                this.fixture.DataContext.Posts.Add(new Post()
                {
                    Id = 27,
                    Title = "Test Commit Transaction 27",
                    Content = "Test Commit Transaction 27 Content"
                });

                this.fixture.DataContext.SaveChanges();

                throw new Exception("Some exception");

                this.fixture.DataContext.Commit();

            }
            catch (Exception)
            {

                this.fixture.DataContext.Rollback();
            }

            var post = await this.fixture.DataContext.Posts.AsNoTracking().Where(p => p.Id == 26).FirstOrDefaultAsync();

            Assert.Null(post);

            post = await this.fixture.DataContext.Posts.AsNoTracking().Where(p => p.Id == 27).FirstOrDefaultAsync();

            Assert.Null(post);
        }
    

        //[Fact]
        public async void TestUpdatePostWithoutLocal() {
            var post = new SavePostDto()
            {
                Id = 1,
                UserId = "1234567890",
                Title = "This is post title",
                Content = "This is post content",
                Publish = 1,
                PublishDate = DateTime.Now,
                Tags = new List<string>() { "First Tag", "Second Tag", "Third Tag" }
            };

            var result = await this._postService.UpdatePost(post);

            Assert.Equal(result.Code, ResultCode.OK);

            var postE = this.fixture.DataContext.Posts.Find(post.Id);

            Assert.NotNull(postE);
            Assert.Equal("This is post title", postE.Title);
            Assert.NotEmpty(postE.PostTags);
            Assert.Equal(3, postE.PostTags.Count);
        }
    }
}
