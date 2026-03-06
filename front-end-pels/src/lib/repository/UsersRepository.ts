import type { AxiosInstance } from 'axios';
import { BaseRepository } from './BaseRepository';

export interface UserDto {
  id: number;
  name: string;
  email?: string;
}

export class UsersRepository extends BaseRepository<UserDto> {
  constructor(http: AxiosInstance) {
    super(http, '/users');
  }
}
