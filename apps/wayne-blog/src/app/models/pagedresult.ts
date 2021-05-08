export class PagedResult<T> {
  currentPage: number;
  pageCount: number;
  pageSize: number;
  rowCount: number;
  results: Array<T>;
}
