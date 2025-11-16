"use client"

import Link from "next/link"
import type {Post} from "@/lib/types"

type PostCardProps = {
  post: Post
  onVote: (postId: number, voteType: "up" | "down") => void
  error?: string
  voting?: boolean
  onDismissError?: () => void
}

export default function PostCard({ post, onVote, error, voting }: PostCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex gap-4">
        <div className="flex flex-col items-center space-y-2 min-w-[60px]">
          <button
            onClick={() => onVote(post.id, "up")}
            disabled={!!voting}
            className={`p-2 rounded-full transition-colors ${
              voting ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
            }`}
            aria-label="Votar positivo"
          >
            <svg
              className={`w-6 h-6 ${
                post.userVote === 1 ? "text-green-600" : "text-gray-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          <span className="text-xl font-semibold text-textDark">{post.votes}</span>

          <button
            onClick={() => onVote(post.id, "down")}
            disabled={!!voting}
            className={`p-2 rounded-full transition-colors ${
              voting ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
            }`}
            aria-label="Votar negativo"
          >
            <svg
              className={`w-6 h-6 ${
                post.userVote === -1 ? "text-red-600" : "text-gray-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

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

          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
