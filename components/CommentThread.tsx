"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

interface Comment {
  id: number
  content: string
  author: string
  isAnonymous: boolean
  createdAt: string
  votes: number
  isOfficial: boolean
  replies: Comment[]
}

interface CommentThreadProps {
  comment: Comment
  onVote: (commentId: number, voteType: boolean) => void
  onReply: (parentId: number, replyContent: string) => void
  level?: number
}

export default function CommentThread({ comment, onVote, onReply, level = 0 }: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const { user } = useAuth()

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

  const handleSubmitReply = () => {
    if (!replyContent.trim() || !user) return

    onReply(comment.id, replyContent)
    setReplyContent("")
    setIsReplying(false)
  }

  // recuo: base + por nível
  const BASE_INDENT = 12 // px
  const INDENT_PER_LEVEL = 40 // px
  const marginLeft = BASE_INDENT + (level ?? 0) * INDENT_PER_LEVEL

  return (
    <div style={{ marginLeft: `${marginLeft}px` }} className="relative">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center space-y-1 min-w-[40px]">
            <button
              onClick={() => onVote(comment.id, true)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Votar positivo"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            <span className="text-sm font-medium text-textDark">{comment.votes}</span>

            <button
              onClick={() => onVote(comment.id, false)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Votar negativo"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 text-sm text-gray-500">
              <span className="font-medium">{comment.isAnonymous ? "Anônimo" : comment.author}</span>
              <span>•</span>
              <span>{formatDate(comment.createdAt)}</span>
            </div>

            <p className="text-gray-700 mb-3 leading-relaxed">{comment.content}</p>

            {level === 0 && user && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-sm text-wine hover:text-wine/80 transition-colors"
              >
                {isReplying ? "Cancelar" : "Responder"}
              </button>
            )}
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="mt-3 ml-[60px] relative">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Escreva sua resposta..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-wine focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setIsReplying(false)
                  setReplyContent("")
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={!replyContent.trim()}
                className="px-4 py-2 text-sm bg-wine text-white rounded-lg hover:bg-wine/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar Resposta
              </button>
            </div>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentThread key={reply.id} comment={reply} onVote={onVote} onReply={onReply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
