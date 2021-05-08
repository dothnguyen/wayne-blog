using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using wayne_blog_api.Models;

namespace wayne_blog_api.Db
{
    public class DataContext: DbContext
    {

         public DataContext(DbContextOptions<DataContext> options): base(options) { }

        public DbSet<Post> Posts { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<PostTag> PostTags { get; set; }

        public DbSet<User> Users { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.Entity<PostTag>().HasKey(sc => new { sc.PostId, sc.TagId });

            modelBuilder.Entity<PostTag>()
                        .HasOne<Post>(sc => sc.Post)
                        .WithMany(s => s.PostTags)
                        .HasForeignKey(sc => sc.PostId);

            modelBuilder.Entity<PostTag>()
                        .HasOne<Tag>(sc => sc.Tag)
                        .WithMany(s => s.PostTags)
                        .HasForeignKey(sc => sc.TagId);

            modelBuilder.Entity<Post>()
                        .HasOne<User>(p => p.User)
                        .WithMany(u => u.Posts)
                        .HasForeignKey(p => p.UserId);
        }

        #region Transaction
        private IDbContextTransaction _transaction;

        public void BeginTransaction()
        { 
            _transaction = Database.BeginTransaction();
        }
    
        public void Commit()
        {
            SaveChanges();
            _transaction.Commit();
            _transaction.Dispose();
        }
    
        public void Rollback()
        { 
            _transaction.Rollback();
            _transaction.Dispose();
        }
        #endregion
        
        public override bool Equals(object obj)
        {
            return obj is DataContext context &&
                   base.Equals(obj) &&
                   System.Collections.Generic.EqualityComparer<IDbContextTransaction>.Default.Equals(_transaction, context._transaction);
        }

        public override int GetHashCode()
        {
            HashCode hash = new HashCode();
            hash.Add(base.GetHashCode());
            return hash.ToHashCode();
        }
    }
}