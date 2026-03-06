import type { AxiosInstance } from 'axios';

export abstract class BaseRepository<T extends { id?: string | number }> {
  protected readonly http: AxiosInstance;
  protected readonly resourcePath: string;

  constructor(http: AxiosInstance, resourcePath: string) {
    this.http = http;
    this.resourcePath = resourcePath;
  }

  async list(params?: Record<string, unknown>): Promise<T[]> {
    const { data } = await this.http.get<T[]>(this.resourcePath, { params });
    return data;
  }

  async get(id: string | number): Promise<T> {
    const { data } = await this.http.get<T>(`${this.resourcePath}/${id}`);
    return data;
  }

  async create(payload: Omit<T, 'id'>): Promise<T> {
    const { data } = await this.http.post<T>(this.resourcePath, payload);
    return data;
  }

  async update(id: string | number, payload: Partial<T>): Promise<T> {
    const { data } = await this.http.put<T>(
      `${this.resourcePath}/${id}`,
      payload
    );
    return data;
  }

  async remove(id: string | number): Promise<void> {
    await this.http.delete<void>(`${this.resourcePath}/${id}`);
  }
}
