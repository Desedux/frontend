import { http } from './http';
import type { CardModel, CreateCardDto, VoteDto } from './types';

export async function getCards(page: number): Promise<CardModel[]> {
  return http<CardModel[]>(`/card/${page}`);
}

export async function getCardsByCategory(tagId: number, page: number): Promise<CardModel[]> {
  return http<CardModel[]>(`/card/tag/${tagId}/${page}`);
}

export async function getCardById(id: string): Promise<CardModel> {
  return http<CardModel>(`/card/detail/${id}`);
}

export async function createCard(dto: CreateCardDto): Promise<any> {
  return http<any>(`/card`, { method: 'POST', body: dto });
}

export async function voteCard(id: string, vote: boolean): Promise<void> {
  return http<void>(`/card`, {
    method: 'PATCH',
    body: { isUpvote: vote, cardId: id },
  });
}

export async function deleteCard(id: string): Promise<any> {
  return http<any>(`/card/${id}`, { method: 'DELETE' });
}
