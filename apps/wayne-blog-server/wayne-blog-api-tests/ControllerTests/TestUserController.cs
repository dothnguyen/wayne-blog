using Microsoft.AspNetCore.Mvc;
using Moq;
using wayne_blog_api.Common;
using wayne_blog_api.Controllers;
using wayne_blog_api.Dtos;
using wayne_blog_api.Services;
using wayne_blog_api.Services.Impl;
using Xunit;

namespace wayne_blog_api_tests
{
    public class TestUserController: BaseTestClass
    {

        [Fact]
        public async void TestGetUser_Mock_UserExist() {

            // setup
            var mockUserService = new Mock<IUserService>();
            mockUserService.Setup(service => service.GetUser("1234567890")).ReturnsAsync(ServiceResult<UserInfoDto>.OK(new UserInfoDto
            {
                Id = "1234567890",
                UserName = "Wayne Do",
                Email = "dothnguyen@gmail.com",
                AvatarURL = ""
            }));

            var controller = new UsersController(mockUserService.Object);

            // execute
            var result = await controller.GetUser("1234567890");

            // verify
            Assert.NotNull(result.Value);
            var serviceRet = result.Value;
            Assert.Equal(ResultCode.OK, serviceRet.Code);
            Assert.NotNull(serviceRet.Result);

            Assert.Equal("dothnguyen@gmail.com", serviceRet.Result.Email);
        }

        [Fact]
        public async void TestGetUser_Mock_EmptyId()
        {

            // setup
            var mockUserService = new Mock<IUserService>();
            mockUserService.Setup(service => service.GetUser("1234567890")).ReturnsAsync(ServiceResult<UserInfoDto>.OK(new UserInfoDto
            {
                Id = "1234567890",
                UserName = "Wayne Do",
                Email = "dothnguyen@gmail.com",
                AvatarURL = ""
            }));

            var controller = new UsersController(mockUserService.Object);

            // execute
            var result = await controller.GetUser("");

            // verify
            Assert.NotNull(result.Value);
            var serviceRet = result.Value;
            Assert.Equal(ResultCode.ERROR, serviceRet.Code);
            Assert.NotEmpty(serviceRet.Errors);
        }

        
        [Fact]
        public async void TestAddUser_Valid()
        {
            var mockUserService = new Mock<IUserService>();
            var userDto = new SaveUserDto
            {
                UserName = "Wayne Do",
                Email = "dothnguyen@gmail.com",
                AvatarURL = "",
            };

            mockUserService.Setup(service => service.AddUser(userDto)).ReturnsAsync(ServiceResult<bool>.OK(true));
            var controller = new UsersController(mockUserService.Object);

            var result = await controller.AddUser(userDto);

            Assert.NotNull(result.Value);
            var serviceRet = result.Value;
            Assert.Equal(ResultCode.OK, serviceRet.Code);
            Assert.True(serviceRet.Result);
        }

        [Fact]
        public async void TestUpdateUser_Invalid_NoId() {
            var mockUserService = new Mock<IUserService>();

            var controller = new UsersController(mockUserService.Object);

            var result = await controller.UpdateUser("", null);

            Assert.NotNull(result.Value);
            var serviceRet = result.Value;
            Assert.Equal(ResultCode.ERROR, serviceRet.Code);
        }

        
        [Fact]
        public async void TestUpdateUser_Valid() {
            var mockUserService = new Mock<IUserService>();
            var userDto = new SaveUserDto
            {
                Id = "1234567890",
                UserName = "Wayne Do",
                Email = "dothnguyen@gmail.com",
                AvatarURL = "",
            };

            mockUserService.Setup(service => service.UpdateUser(userDto)).ReturnsAsync(ServiceResult<bool>.OK(true));
            var controller = new UsersController(mockUserService.Object);

            var result = await controller.UpdateUser(userDto.Id, userDto);

            Assert.NotNull(result.Value);
            var serviceRet = result.Value;
            Assert.Equal(ResultCode.OK, serviceRet.Code);
            Assert.True(serviceRet.Result);
        }

        // [Fact]
        // public async void TestGetUser_UserExist()
        // {

        //     using (var db = GetDBContext("TestUserController_TestGetUser_UserExist"))
        //     {
        //         var _userService = new UserServiceImpl(db, this.mapper);

        //         var userDto = new SaveUserDto
        //         {
        //             Id = "1234567891",
        //             UserName = "Wayne Do",
        //             Email = "dothnguyen@gmail.com",
        //             AvatarURL = ""
        //         };

        //         var result = await _userService.AddUser(userDto);

        //         Assert.Empty(result.Errors);
        //         Assert.Equal(ResultCode.OK, result.Code);

        //         var controller = new UsersController(_userService);

        //         // execute
        //         var actionResult = await controller.GetUser("1234567891");

        //         // verify
        //         Assert.NotNull(actionResult.Value);
        //         Assert.Equal(ResultCode.OK, actionResult.Value.Code);
        //         Assert.Empty(actionResult.Value.Errors);

        //         Assert.Equal("dothnguyen@gmail.com", actionResult.Value.Result.Email);
        //     }

        // }

        // [Fact]
        // public async void TestGetUser_UserNotExist()
        // {

        //     using (var db = GetDBContext("TestUserController_TestGetUser_UserNotExist"))
        //     {
        //         var _userService = new UserServiceImpl(db, this.mapper);

        //         var userDto = new SaveUserDto
        //         {
        //             Id = "1234567890",
        //             UserName = "Wayne Do",
        //             Email = "dothnguyen@gmail.com",
        //             AvatarURL = ""
        //         };

        //         var result = await _userService.AddUser(userDto);

        //         Assert.Empty(result.Errors);
        //         Assert.Equal(ResultCode.OK, result.Code);

        //         var controller = new UsersController(_userService);

        //         // execute
        //         var actionResult = await controller.GetUser("123456789011");

        //         // verify
        //         Assert.NotNull(actionResult.Value);
        //         Assert.Equal(ResultCode.ERROR, actionResult.Value.Code);
        //         Assert.NotEmpty(actionResult.Value.Errors);
        //     }

        // }

        // [Fact]
        // public async void TestGetUser_EmptyId()
        // {

        //     using (var db = GetDBContext("TestUserController"))
        //     {
        //         var _userService = new UserServiceImpl(db, this.mapper);

        //         var controller = new UsersController(_userService);

        //         // execute
        //         var actionResult = await controller.GetUser("");

        //         // verify
        //         Assert.NotNull(actionResult.Value);
        //         Assert.Equal(ResultCode.ERROR, actionResult.Value.Code);
        //         Assert.NotEmpty(actionResult.Value.Errors);
        //     }

        // }
    }
}