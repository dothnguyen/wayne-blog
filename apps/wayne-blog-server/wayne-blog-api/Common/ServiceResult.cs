using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace wayne_blog_api.Common
{
    public enum ResultCode {
        OK = 0,
        ERROR = 1
    }

    public class ServiceResult<T>
    {

        public static ServiceResult<T> OK(T value) {
            var ret = new ServiceResult<T>();
            ret.SetResult(value);
            return ret;
        }

        public static ServiceResult<T> ERROR(string error = "") {
            var ret = new ServiceResult<T>(ResultCode.ERROR);
            if (!string.IsNullOrEmpty(error))
                ret.AddError(error);
            return ret;
        }

        public ResultCode Code { get; set; }

        public List<string> Errors { get; set; }

        public T Result { get; set; }

        [JsonIgnore]
        public bool HasError { 
            get {
                return this.Code == ResultCode.ERROR;
            }
        }

        public ServiceResult(ResultCode code = ResultCode.OK)
        {
            this.Code = code;
            this.Errors = new List<string>();
        }

        public void AddError(string error) {
            if (this.Code != ResultCode.ERROR)
                this.Code = ResultCode.ERROR;
            
            this.Errors.Add(error);            
         }

         public void AddErrors(List<string> errors) {
            if (this.Code != ResultCode.ERROR)
                this.Code = ResultCode.ERROR;

            this.Errors.AddRange(errors);
        }

         public void SetResult(T result) {
             this.Result = result;
         }
    }
}