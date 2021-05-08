using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using wayne_blog_api;
using wayne_blog_api.Common;
using wayne_blog_api.Db;
using wayne_blog_api.Dtos;
using Xunit;

namespace wayne_blog_api_integration_tests
{
    public class UserControllerIntegrationTest: BaseIntegrationTest
    {
        public UserControllerIntegrationTest(CustomWebApplicationFactory<Startup> factory) : base(factory)
        {
        }

        [Fact]
        public async void TestAddUser()
        {

            var saveDto = new SaveUserDto
            {
                Id = "1234567890",
                UserName = "Wayne Test 2",
                Email = "dothnguyen@gmail.com",
                AvatarURL = "https://google.com"
            };

            var response = await _client.PostAsync("/api/users", Utility.GetStringContent(saveDto));

            var value = await response.Content.ReadAsStringAsync();
            response.EnsureSuccessStatusCode();

            var stringResponse = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<ServiceResult<bool>>(stringResponse);

            Assert.NotNull(result);
            Assert.Equal(ResultCode.OK, result.Code);
            Assert.True(result.Result);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async void TestAddUser_Model_Validate_Error()
        {

            var saveDto = new SaveUserDto
            {
                Id = "1234567890",
                UserName = "",
                Email = "",
                AvatarURL = "https://google.com"
            };

            var response = await _client.PostAsync("/api/users", Utility.GetStringContent(saveDto));

            var value = await response.Content.ReadAsStringAsync();
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var stringResponse = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<ServiceResult<bool>>(stringResponse);

            Assert.NotNull(result);
            Assert.Equal(ResultCode.ERROR, result.Code);
            Assert.Equal(3, result.Errors.Count);
        }

        [Fact]
        public async void TestUpdateUser_Validate_Error()
        {

            var saveDto = new SaveUserDto
            {
                Id = "123",
                UserName = "Wayne Test 2",
                Email = "dothnguyen@gmail.com",
                AvatarURL = "https://google.com"
            };

            var response = await _client.PutAsync($"/api/users/{saveDto.Id}", Utility.GetStringContent(saveDto));

            var value = await response.Content.ReadAsStringAsync();
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

            var stringResponse = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<ServiceResult<bool>>(stringResponse);

            Assert.NotNull(result);
            Assert.Equal(ResultCode.ERROR, result.Code);
        }
    }
}