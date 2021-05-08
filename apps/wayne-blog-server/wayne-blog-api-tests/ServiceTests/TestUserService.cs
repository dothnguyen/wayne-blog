using wayne_blog_api.Common;
using wayne_blog_api.Dtos;
using wayne_blog_api.Services.Impl;
using Xunit;

namespace wayne_blog_api_tests
{
    public class TestUserService: BaseTestClass
    {
        [Fact]
        public async void TestAddUser() {
            using(var db = GetDBContext("TestUserService_TestAddUser")) {
                var _userService = new UserServiceImpl(db, this.mapper);

                var userDto = new SaveUserDto {
                    Id = "1234567890",
                    UserName = "Wayne Do",
                    Email = "dothnguyen@gmail.com",
                    AvatarURL = ""
                };

                var result = await _userService.AddUser(userDto);

                Assert.Empty(result.Errors);
                Assert.Equal(ResultCode.OK, result.Code);

                var user = await db.Users.FindAsync("1234567890");
                Assert.NotNull(user);
                Assert.Equal("dothnguyen@gmail.com", user.Email);
                Assert.Empty(user.AvatarURL);
            }
        }

        [Fact]
        public async void TestUpdateUser() {
            using (var db = GetDBContext("TestUserService_TestUpdateUser"))
            {
                var _userService = new UserServiceImpl(db, this.mapper);

                var userDto = new SaveUserDto
                {
                    Id = "1234567890",
                    UserName = "Wayne Do",
                    Email = "dothnguyen@gmail.com",
                    AvatarURL = ""
                };

                var result = await _userService.AddUser(userDto);

                Assert.Empty(result.Errors);
                Assert.Equal(ResultCode.OK, result.Code);

                var updateDto = new SaveUserDto {
                    Id = "1234567890",
                    UserName = "Wayne Do Test",
                    Email = "dothnguyen@gmail.com",
                    AvatarURL = "https://google.com"
                };

                result = await _userService.UpdateUser(updateDto);
                Assert.Empty(result.Errors);
                Assert.Equal(ResultCode.OK, result.Code);

                var user = await db.Users.FindAsync("1234567890");
                Assert.NotNull(user);
                Assert.Equal("Wayne Do Test", user.UserName);
                Assert.Equal("https://google.com", user.AvatarURL);
            }
        }
    }
}