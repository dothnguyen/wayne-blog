using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using wayne_blog_api.Common;
using wayne_blog_api.Db;
using wayne_blog_api.Dtos;
using wayne_blog_api.Models;

namespace wayne_blog_api.Services.Impl
{
    public class UserServiceImpl : IUserService
    {
        private readonly IMapper _mapper;
        private readonly DataContext _context;

        public UserServiceImpl(DataContext dataContext, IMapper mapper)
        {
            this._mapper = mapper;
            this._context = dataContext;
        }

        public async Task<ServiceResult<bool>> AddUser(SaveUserDto userDto)
        {
            var user = this._mapper.Map<User>(userDto);

            this._context.Users.Add(user);
            await this._context.SaveChangesAsync();

            return ServiceResult<bool>.OK(true);
        }

        public async Task<ServiceResult<UserInfoDto>> GetUser(string Id)
        {
            if (string.IsNullOrWhiteSpace(Id))
                return ServiceResult<UserInfoDto>.ERROR("User id can not be empty.");

            var user = await this._context.Users.FindAsync(Id);

            if (user == null)
                return ServiceResult<UserInfoDto>.ERROR("User does not exist");

            return ServiceResult<UserInfoDto>.OK(this._mapper.Map<UserInfoDto>(user));
        }

        public async Task<ServiceResult<bool>> UpdateUser(SaveUserDto userDto)
        {

            var user = this._context.Users.Find(userDto.Id);
            if (user == null)
                return ServiceResult<bool>.ERROR("User does not exist");

            this._mapper.Map<SaveUserDto, User>(userDto, user);

            this._context.Entry(user).State = EntityState.Modified;

            await this._context.SaveChangesAsync();

            return ServiceResult<bool>.OK(true);
        }
    }
}