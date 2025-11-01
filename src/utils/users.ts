import { Pagination } from "./pagination.ts";

export type PaginatedUsers = Pagination & {
  users: User[];
};

export type User = {
  name: string;
  id: string;
};

export type BackendUser = {
  id: string;
  username: string | null;
  email: string | null;
  name: string | null;
  picture: string | null;
};

export type BackendPaginatedUsers = {
  users: BackendUser[];
  page: number;
  pageSize: number;
  total: number;
};
