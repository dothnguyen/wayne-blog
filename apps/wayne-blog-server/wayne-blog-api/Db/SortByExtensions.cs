using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

namespace wayne_blog_api.Db
{
    public static class SortByExtensions
    {
        public static IQueryable<T> SortBy<T>(this IQueryable<T> query, string sort, int? order) where T : class
        {
            if (!string.IsNullOrEmpty(sort))
            {
                // LAMBDA: x => x.[PropertyName]
                var parameter = Expression.Parameter(typeof(T), "x");
                Expression property = Expression.Property(parameter, sort);
                var lambda = Expression.Lambda(property, parameter);

                MethodInfo orderByMethod;

                if (order == 1)
                {
                    orderByMethod = typeof(Queryable).GetMethods().First(x => x.Name == "OrderBy" && x.GetParameters().Length == 2);
                }
                else
                {
                    orderByMethod = typeof(Queryable).GetMethods().First(x => x.Name == "OrderByDescending" && x.GetParameters().Length == 2);
                }

                if (orderByMethod != null)
                {
                    var orderByGeneric = orderByMethod.MakeGenericMethod(typeof(T), property.Type);
                    query = (IQueryable<T>)orderByGeneric.Invoke(null, new object[] { query, lambda });
                }
            }

            return query;
        }
    }
}