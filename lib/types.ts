export interface Post {
  id: number
  title: string
  content: string
  author: string
  isAnonymous: boolean
  createdAt: string
  votes: number
  commentCount: number
  tags: string[]
  category: string
  officialResponse: boolean
  userVote: number
  userUid?: string
}

export interface Comment {
  id: number
  content: string
  author: string
  isAnonymous: boolean
  createdAt: string
  votes: number
  isOfficial: boolean
  replies: Comment[]
  deactivate?: boolean
  userUid?: string
  user_uid?: string
  userVote: number
}

interface CommentThreadProps {
  comment: Comment
  onVote: (commentId: number, voteType: boolean) => void | Promise<void>
  onReply: (parentId: number, replyContent: string) => void | Promise<void>
  onDelete?: (commentId: number) => void | Promise<void>
  level?: number
  error?: string
  onDismissError?: () => void
}
export interface User {
  id: number
  email: string
  name: string
  isAdmin: boolean
}

export interface Category {
  id: number
  name: string
  description: string
  icon: string
  postCount: number
  color: string
}
