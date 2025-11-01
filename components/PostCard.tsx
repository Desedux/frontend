"use client"

import Link from "next/link"

interface Post {
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
}

interface PostCardProps {
  post: Post
  onVote: (postId: number, voteType: "up" | "down") => void
}

export default function PostCard({ post, onVote }: PostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Vote Column */}
        <div className="flex flex-col items-center space-y-2 min-w-[60px]">
          <button
            onClick={() => onVote(post.id, "up")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Votar positivo"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          <span className="text-lg font-semibold text-textDark">{post.votes}</span>

          <button
            onClick={() => onVote(post.id, "down")}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Votar negativo"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <Link href={`/post/${post.id}`} className="flex-1">
              <h2 className="text-xl font-semibold text-textDark hover:text-wine transition-colors cursor-pointer">
                {post.title}
              </h2>
            </Link>

            {post.officialResponse && (
              <span className="bg-wine/10 text-wine px-3 py-1 rounded-full text-sm font-medium ml-4">
                Resposta Oficial
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Por: {post.isAnonymous ? "Anônimo" : post.author}</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>

            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{post.commentCount} comentários</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
