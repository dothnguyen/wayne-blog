export enum SortDir {
    ASC = 1,
    DESC = 2
};

export type SortParam = {
  [key: string]: SortDir
}
