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
  deactivate?: boolean
  user_uid?: string
  userVote?: number
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

function extractUidFromToken(token?: string): string | null {
  if (!token || typeof window === "undefined") return null

  try {
    const [, payload] = token.split(".")
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = JSON.parse(atob(normalized))
    return decoded.user_id ?? null
  } catch {
    return null
  }
}

export default function CommentThread({
                                        comment,
                                        onVote,
                                        onReply,
                                        onDelete,
                                        level = 0,
                                        error,
                                        onDismissError,
                                      }: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const { user } = useAuth()

  const currentUserUid = extractUidFromToken(user?.tokens.idToken)
  const authorUid = comment.user_uid ?? null
  const isDeleted = comment.deactivate === true
  const canDelete = !!currentUserUid && !!authorUid && currentUserUid === authorUid

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
    if (!replyContent.trim() || !user || isDeleted) return

    onReply(comment.id, replyContent)
    setReplyContent("")
    setIsReplying(false)
  }

  const handleDeleteClick = () => {
    if (!onDelete) return
    setIsConfirmingDelete(true)
  }

  const handleConfirmDelete = async () => {
    if (!onDelete) return
    await onDelete(comment.id)
    setIsConfirmingDelete(false)
  }

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false)
  }

  const BASE_INDENT = 12
  const INDENT_PER_LEVEL = 40
  const marginLeft = BASE_INDENT + (level ?? 0) * INDENT_PER_LEVEL

  const cardBaseClasses = "rounded-lg shadow-sm border p-4"
  const cardClasses = "bg-white border-gray-200"

  return (
    <>
      <div style={{ marginLeft: `${marginLeft}px` }} className="relative">
        <div className={`${cardBaseClasses} ${cardClasses}`}>
          <div className="flex gap-3">
            <div className="flex flex-col items-center space-y-1 min-w-[40px]">
              <button
                onClick={() => onVote(comment.id, true)}
                disabled={isDeleted}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Votar positivo"
              >
                <svg
                  className={`w-4 h-4 ${
                    comment.userVote === 1 ? "text-green-600" : "text-gray-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>

              <span className="text-sm font-medium text-textDark">{comment.votes}</span>

              <button
                onClick={() => onVote(comment.id, false)}
                disabled={isDeleted}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Votar negativo"
              >
                <svg
                  className={`w-4 h-4 ${
                    comment.userVote === -1 ? "text-red-600" : "text-gray-600"
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="font-medium">
                    {comment.isAnonymous ? "Anônimo" : comment.author}
                  </span>
                  <span>•</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>

                {canDelete && !isDeleted && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4m-9 3h14"
                      />
                    </svg>
                    <span>Excluir</span>
                  </button>
                )}
              </div>

              {isDeleted ? (
                <p className="inline-block text-sm text-yellow-900 bg-yellow-100 border border-yellow-300 rounded px-3 py-2">
                  Este comentário foi deletado pelo autor.
                </p>
              ) : (
                <p className="text-gray-700 mb-3 leading-relaxed">{comment.content}</p>
              )}

              {level === 0 && user && !isDeleted && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-sm text-wine hover:text-wine/80 transition-colors"
                >
                  {isReplying ? "Cancelar" : "Responder"}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <div className="flex items-center justify-between gap-2">
                <span>{error}</span>
                {onDismissError && (
                  <button
                    type="button"
                    onClick={onDismissError}
                    className="text-xs font-medium underline"
                  >
                    Fechar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {isReplying && !isDeleted && (
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
              <CommentThread
                key={reply.id}
                comment={reply}
                onVote={onVote}
                onReply={onReply}
                onDelete={onDelete}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>

      {isConfirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm w-full mx-4 p-6">
            <h4 className="text-lg font-semibold text-textDark mb-2">
              Excluir comentário?
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Tem certeza que deseja excluir este comentário? Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
