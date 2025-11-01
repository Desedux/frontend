
import type { CardModel, TagResponseDto } from './api/types';

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
};

export type CategoryVM = {
  id: number;
  name: string;
  description: string;
  icon: string;
  postCount: number;
  color: string;
};

export function mapCardToPostVM(card: CardModel, tagIndex?: Map<number,string>): PostVM {
  return {
    id: card.id,
    title: card.title,
    content: card.description,
    author: card.author,
    isAnonymous: false,
    createdAt: card.created_at,
    votes: card.up_down,
    commentCount: 0,
    tags: [],
    category: '',
    officialResponse: false,
  };
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
