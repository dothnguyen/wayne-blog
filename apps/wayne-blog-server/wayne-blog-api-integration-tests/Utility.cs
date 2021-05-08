using System.Net.Http;
using System.Text;
using Newtonsoft.Json;
using wayne_blog_api.Db;
using wayne_blog_api.Models;

namespace wayne_blog_api_integration_tests
{
    public class Utility
    {
        public static void SeedData(DataContext db) {
            // insert 1 user
            db.Users.Add(new User {
                Id = "123456789",
                UserName = "Wayne Test 1",
                Email = "wayne@qitplus.com",
                AvatarURL = ""
            });
        }

        public static StringContent GetStringContent(object obj)
            => new StringContent(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");
    }
}