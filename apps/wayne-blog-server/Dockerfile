FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /app

# copy csproj and restore as distinct layers
COPY *.sln .
COPY wayne-blog-api/*.csproj ./wayne-blog-api-build/
WORKDIR /app/wayne-blog-api-build
RUN dotnet restore

# copy everything else and build app
COPY wayne-blog-api/. ./wayne-blog-api-build/
WORKDIR /app/wayne-blog-api-build
RUN dotnet clean
RUN dotnet publish -c Release -o ./out

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS runtime
WORKDIR /app
COPY --from=build /app/wayne-blog-api-build/out ./
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "wayne-blog-api.dll"]