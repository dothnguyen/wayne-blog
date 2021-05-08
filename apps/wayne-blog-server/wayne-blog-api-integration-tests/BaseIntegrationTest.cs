using Microsoft.AspNetCore.Mvc.Testing;
using wayne_blog_api;
using wayne_blog_api.Dtos;
using Xunit;

namespace wayne_blog_api_integration_tests
{
    public class BaseIntegrationTest: IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        public readonly System.Net.Http.HttpClient _client;
        public readonly CustomWebApplicationFactory<Startup> _factory;

        public BaseIntegrationTest(CustomWebApplicationFactory<Startup> factory)
        {
            _factory = factory;
            _client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
        }

        
    }
}