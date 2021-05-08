using System.Threading.Tasks;
using wayne_blog_api.Common;
using wayne_blog_api.Dtos;

namespace wayne_blog_api.Services
{
    public interface IUserService
    {
         Task<ServiceResult<bool>> AddUser(SaveUserDto userDto);

         Task<ServiceResult<bool>> UpdateUser(SaveUserDto userDto);

         Task<ServiceResult<UserInfoDto>> GetUser(string Id);
    }
}