
export enum ResultCode {
    OK,
    ERROR
}

export class ServiceResult {
    code: ResultCode;
    errors: Array<string>;
    result: any;
}
