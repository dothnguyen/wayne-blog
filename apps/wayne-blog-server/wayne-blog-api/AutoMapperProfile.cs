using System.Linq;
using AutoMapper;
using wayne_blog_api.Dtos;
using wayne_blog_api.Models;

namespace wayne_blog_api
{
    public class AutoMapperProfile: Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<SavePostDto, Post>();
            CreateMap<SaveUserDto, User>();
            CreateMap<User, UserInfoDto>();
            CreateMap<Post, PostDto>()
                    .ForMember(x => x.Tags, m => m.MapFrom(v => v.PostTags.Select(pt => pt.Tag.Value)))
                    .ForMember(x => x.UserName, m => m.MapFrom(v => v.User.UserName))
                    .ForMember(x => x.AvatarUrl, m => m.MapFrom(v => v.User.AvatarURL));
        }   
    }
}