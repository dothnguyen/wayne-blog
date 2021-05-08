using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using wayne_blog_api.Common;
using wayne_blog_api.Dtos;
using wayne_blog_api.Services;

namespace wayne_blog_api.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService) {
            this._userService = userService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceResult<UserInfoDto>>> GetUser(string id) {
            if (string.IsNullOrWhiteSpace(id))
                return ServiceResult<UserInfoDto>.ERROR("User Id can not be blank.");

            return await this._userService.GetUser(id);
        }

        [HttpPost]
        public async Task<ActionResult<ServiceResult<bool>>> AddUser(SaveUserDto userDto) {

            return await this._userService.AddUser(userDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ServiceResult<bool>>> UpdateUser(string id, SaveUserDto userDto)
        {
            if (string.IsNullOrEmpty(id))
                return ServiceResult<bool>.ERROR("User id can not be blank.");

            if (userDto == null)
                ServiceResult<bool>.ERROR("User information can not be empty.");

            return await this._userService.UpdateUser(userDto);
        }
    }
}