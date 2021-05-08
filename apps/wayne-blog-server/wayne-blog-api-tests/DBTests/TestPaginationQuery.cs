using Bogus;
using Microsoft.EntityFrameworkCore;
using wayne_blog_api.Db;
using wayne_blog_api.Models;
using wayne_blog_api.Pagination;
using Xunit;

namespace wayne_blog_api_tests
{

    public class TestPaginationQuery: BaseTestClass
    {

        public TestPaginationQuery(): base()
        {
            
        }

        private void setUp(DataContext dataContext)
        {

            var faker = new Faker("en");
            // create 23 posts
            for (var i = 0; i < 23; i++)
            {
                var post = new Post()
                {
                    Id = i + 1,
                    Content = faker.Lorem.Paragraph(),
                    Title = faker.Lorem.Sentence(),
                    Publish = faker.Random.Byte(1, 3),
                    PublishDate = faker.Date.Recent(2)
                };

                dataContext.Posts.Add(post);
            }

            dataContext.SaveChanges();
        }


        [Fact]
        public async void TestGetPaged()
        {
            using (var DataContext = this.GetDBContext("TestGetPaged"))
            {

                this.setUp(DataContext);

                var count = await DataContext.Posts.CountAsync();
                Assert.Equal(23, count);

                // get first page
                var result = DataContext.Posts.AsNoTracking().GetPaged(1, 5);

                Assert.Equal(1, result.CurrentPage);
                Assert.Equal(23, result.RowCount);
                Assert.Equal(5, result.PageCount);
                Assert.Equal(5, result.Results.Count);

                var post = result.Results[4];
                Assert.Equal(5, post.Id);

                // get second page
                result = DataContext.Posts.AsNoTracking().GetPaged(2, 5);
                Assert.Equal(5, result.Results.Count);

                post = result.Results[0];
                Assert.Equal(6, post.Id);
                post = result.Results[4];
                Assert.Equal(10, post.Id);

                // get last page
                result = DataContext.Posts.AsNoTracking().GetPaged(5, 5);
                Assert.Equal(3, result.Results.Count);

                post = result.Results[0];
                Assert.Equal(21, post.Id);
                post = result.Results[2];
                Assert.Equal(23, post.Id);
            }
            
        }

        [Fact]
        public async void TestGetPagedAsync()
        {
            using (var DataContext = this.GetDBContext("TestGetPagedAsync"))
            {
                this.setUp(DataContext);

                // get first page
                var result = await DataContext.Posts.AsNoTracking().GetPagedAsync(1, 5);

                Assert.Equal(1, result.CurrentPage);
                Assert.Equal(23, result.RowCount);
                Assert.Equal(5, result.PageCount);
                Assert.Equal(5, result.Results.Count);

                var post = result.Results[4];
                Assert.Equal(5, post.Id);

                // get second page
                result = await DataContext.Posts.AsNoTracking().GetPagedAsync(2, 5);
                Assert.Equal(5, result.Results.Count);

                post = result.Results[0];
                Assert.Equal(6, post.Id);
                post = result.Results[4];
                Assert.Equal(10, post.Id);

                // get last page
                result = await DataContext.Posts.AsNoTracking().GetPagedAsync(5, 5);
                Assert.Equal(3, result.Results.Count);

                post = result.Results[0];
                Assert.Equal(21, post.Id);
                post = result.Results[2];
                Assert.Equal(23, post.Id);
            }
        }
    }
}
