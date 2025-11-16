
import type { CardModel, TagResponseDto } from './api/types';
import {Post} from "@/lib/types";

export type PostVM = {
  id: number;
  title: string;
  content: string;
  author: string;
  isAnonymous: boolean;
  createdAt: string;
  votes: number;
  commentCount: number;
  tags: string[];
  category: string;
  officialResponse: boolean;
  userVote: number;
};

export type CategoryVM = {
  id: number;
  name: string;
  description: string;
  icon: string;
  postCount: number;
  color: string;
};

export function mapCardToPostVM(card: any, tagIndex: Map<number, string>): Post {
  return {
    id: card.id,
    title: card.title,
    content: card.description,
    author: card.author,
    isAnonymous: false,
    createdAt: card.created_at,
    votes: card.up_down ?? 0,
    userVote: card.user_vote ?? 0,
    commentCount: 0,
    tags: [],
    category: "",
    officialResponse: false,
    userUid: card.user_id
  }
}

export function mapTagToCategoryVM(tag: TagResponseDto): CategoryVM {
  return {
    id: tag.id,
    name: tag.name,
    description: tag.description ?? '',
    icon: tag.image_url ?? 'Tag',
    postCount: 0,
    color: '#EEE',
  };
}
