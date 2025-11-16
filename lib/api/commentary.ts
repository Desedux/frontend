import { http } from './http'
import type {PaginatedCommentsResponse, CommentResponseDto, ReactionResponseDto, ReactionDto} from './types'

export type CreateCommentDto = { content: string; parentId?: number | null }
export type UpdateCommentDto = { content: string }

export async function listComments(
  cardId: number,
  opts?: { parentId?: number; page?: number; limit?: number },
) {
  const q = new URLSearchParams()
  if (opts?.parentId != null) q.set('parentId', String(opts.parentId))
  if (opts?.page != null) q.set('page', String(opts.page))
  if (opts?.limit != null) q.set('limit', String(opts.limit))
  return http<PaginatedCommentsResponse>(`/commentary/${cardId}?${q.toString()}`)
}

export async function createComment(cardId: number, dto: CreateCommentDto) {
  console.log('Creating comment', cardId, dto)
  return http<CommentResponseDto>(`/commentary/${cardId}`, { method: 'POST', body: dto });
}

export async function updateComment(cardId: number, commentId: number, dto: UpdateCommentDto) {
  return http<CommentResponseDto>(`/commentary/${cardId}/${commentId}`, { method: 'PATCH', body: dto });
}

export async function deleteComment(cardId: number, commentId: number) {
  return http<{ success: true }>(`/commentary/${cardId}/${commentId}`, { method: 'DELETE' });
}

export async function setReaction(cardId: string, commentId: string, vote: boolean) {
  return http<ReactionResponseDto>(`/commentary`, {
    method: 'PATCH',
    body: { isUpvote: vote, cardId: cardId, commentaryId: commentId },
  });
}
