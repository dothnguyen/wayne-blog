using System;
using Bogus;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using wayne_blog_api.Db;
using wayne_blog_api.Models;
using Xunit;

namespace wayne_blog_api_tests
{
    public class InMemoryDBFixture: IDisposable
    {
        public DataContext DataContext { get; private set; }

        public readonly ILoggerFactory MyLoggerFactory;

        public InMemoryDBFixture()
        {
            MyLoggerFactory = LoggerFactory.Create(builder => { builder.AddConsole(); });

            var options = new DbContextOptionsBuilder<DataContext>()
                .UseInMemoryDatabase(databaseName: "wayne-blog-test")
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .UseLoggerFactory(MyLoggerFactory)
                .Options;

            DataContext = new DataContext(options);
            
            this.setUp();
        }

        private void setUp() {
           
            var faker = new Faker("en");
            // create 23 posts
            for (var i = 0; i < 23; i++) {
                var post = new Post() {
                    Id = i + 1,
                    Content = faker.Lorem.Paragraph(),
                    Title = faker.Lorem.Sentence(),
                    Publish = faker.Random.Byte(1,3),
                    PublishDate = faker.Date.Recent(2)
                };

                DataContext.Posts.Add(post);
            }

            DataContext.SaveChanges();
        }

        public void Dispose()
        {
            DataContext.Dispose();
        }
    }

    [CollectionDefinition("InMemoryDatabaseCollection")]
    public class DatabaseCollection : ICollectionFixture<InMemoryDBFixture>
    {
        // This class has no code, and is never created. Its purpose is simply
        // to be the place to apply [CollectionDefinition] and all the
        // ICollectionFixture<> interfaces.
    }

    public class MySqlDBFixture: IDisposable
    {
        public DataContext DataContext { get; private set; }
        

        public MySqlDBFixture()
        {
            LoggerFactory.Create(builder => { builder.AddConsole(); });

            var options = new DbContextOptionsBuilder<DataContext>()
                .UseNpgsql("")
                .UseLoggerFactory(LoggerFactory.Create(builder => { builder.AddConsole(); }))
                .Options;

            DataContext = new DataContext(options);
            
            this.setUp();
        }

        private void setUp() {
           
            // var faker = new Faker("en");
            // // create 23 posts
            // for (var i = 0; i < 23; i++) {
            //     var post = new Post() {
            //         Id = i + 1,
            //         Content = faker.Lorem.Paragraph(),
            //         Title = faker.Lorem.Sentence(),
            //         Publish = faker.Random.Byte(1,3),
            //         PublishDate = faker.Date.Recent(2)
            //     };

            //     DataContext.Posts.Add(post);
            // }

            // DataContext.SaveChanges();
        }

        public void Dispose()
        {
            DataContext.Database.ExecuteSqlRaw("delete from PostTags;");
            DataContext.Database.ExecuteSqlRaw("delete from Posts;");
            DataContext.Database.ExecuteSqlRaw("delete from Tags;");
            DataContext.Dispose();
        }
    }

    [CollectionDefinition("MySqlDatabaseCollection")]
    public class MySqlDatabaseCollection : ICollectionFixture<MySqlDBFixture>
    {
        // This class has no code, and is never created. Its purpose is simply
        // to be the place to apply [CollectionDefinition] and all the
        // ICollectionFixture<> interfaces.
    }
}