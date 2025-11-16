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
