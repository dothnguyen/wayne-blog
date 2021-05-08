using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using wayne_blog_api.Common;
using wayne_blog_api.Db;
using wayne_blog_api.Services;
using wayne_blog_api.Services.Impl;

namespace wayne_blog_api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            //var builder = new SqlConnectionStringBuilder(
            //            Configuration.GetConnectionString("DefaultConnection"));
            //builder.Password = Configuration["DbPassword"];
            //_connection = builder.ConnectionString;
            //var connectionString = Configuration.GetConnectionString("DefaultConnection");
            //connectionString = connectionString.Replace("XXXXXXX", Configuration["DbPassword"]);

            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

            string connStr;

            // Depending on if in development or production, use either Heroku-provided
            // connection string, or development connection string from env var.
            if (env == "Development")
            {
                var connectionString = Configuration.GetConnectionString("DefaultConnection");
                connStr = connectionString;//.Replace("XXXXXXX", Configuration["DbPassword"]);
            }
            else
            {
                // Use connection string provided at runtime by Heroku.
                var connUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

                // Parse connection URL to connection string for Npgsql
                connUrl = connUrl.Replace("postgres://", string.Empty);
                var pgUserPass = connUrl.Split("@")[0];
                var pgHostPortDb = connUrl.Split("@")[1];
                var pgHostPort = pgHostPortDb.Split("/")[0];
                var pgDb = pgHostPortDb.Split("/")[1];
                var pgUser = pgUserPass.Split(":")[0];
                var pgPass = pgUserPass.Split(":")[1];
                var pgHost = pgHostPort.Split(":")[0];
                var pgPort = pgHostPort.Split(":")[1];

                connStr = $"Server={pgHost};Port={pgPort};User Id={pgUser};Password={pgPass};Database={pgDb};Pooling=true;SSL Mode=Require;TrustServerCertificate=True;";
            }

            services.AddDbContext<DataContext>(x => x.UseNpgsql(connStr));
    
            services.AddScoped<IPostService, PostServiceImpl>();
            services.AddScoped<IUserService, UserServiceImpl>();


            // Add Cors
            services.AddCors(o => o.AddPolicy("DevPolicy", builder =>
            {
                builder.AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowAnyHeader();
            }));

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_3_0)
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    //var problems = new CustomBadRequest(context);
                    var errors = context.ModelState
                            .Where(a => a.Value.Errors.Count > 0)
                            .SelectMany(x => x.Value.Errors)
                            .Select(error => error.ErrorMessage)
                            .ToList();

                    var result = ServiceResult<bool>.ERROR();
                    result.AddErrors(errors);
                    
                    return new OkObjectResult(result);
                };
            });

            services.AddControllers();
            services.AddAutoMapper(typeof(Startup));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                
            }

            //app.UseHttpsRedirection();
            //app.UseCors("DevPolicy");
            app.UseCors(s => s.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
