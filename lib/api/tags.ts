import { http } from './http';
import type { TagResponseDto } from './types';

export async function getTags(): Promise<TagResponseDto[]> {
  return http<TagResponseDto[]>(`/tags`);
}
