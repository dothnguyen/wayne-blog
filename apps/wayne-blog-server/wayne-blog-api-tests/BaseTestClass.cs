using System.Linq;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using wayne_blog_api;
using wayne_blog_api.Db;

namespace wayne_blog_api_tests
{
    public class BaseTestClass
    {
        public IMapper mapper {get;}

        public BaseTestClass()
        {
            //this.fixture = fixture;

            var configuration = new MapperConfiguration(cfg =>
                                {
                                    cfg.AddProfile(new AutoMapperProfile());
                                });

            this.mapper = configuration.CreateMapper();
            
        }

        public DataContext GetDBContext(string name = "wayne-test") {
            var MyLoggerFactory = LoggerFactory.Create(builder => { builder.AddConsole(); });

            var options = new DbContextOptionsBuilder<DataContext>()
                .UseInMemoryDatabase(databaseName: name)
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .UseLoggerFactory(MyLoggerFactory)
                .Options;

            var DataContext = new DataContext(options);

            return DataContext;
        }

        public void DetachAllEntities(DataContext db)
        {
            var changedEntriesCopy = db.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added ||
                            e.State == EntityState.Modified ||
                            e.State == EntityState.Deleted)
                .ToList();

            foreach (var entry in changedEntriesCopy)
                entry.State = EntityState.Detached;
        }
    }
}