"use client"

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

interface OfficialResponseCommentProps {
  comment: Comment
  onVote: (commentId: number, voteType: boolean) => void | Promise<void>
  error?: string
  onDismissError?: () => void
}

export default function OfficialResponseComment({
                                                  comment,
                                                  onVote,
                                                  error,
                                                  onDismissError,
                                                }: OfficialResponseCommentProps) {
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
    <div className="bg-wine/5 border-2 border-wine rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <div className="bg-wine text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <span className="text-wine text-xs font-bold">W</span>
          </div>
          <span>Resposta Oficial</span>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col items-center space-y-2 min-w-[50px]">
          <button
            onClick={() => onVote(comment.id, true)}
            className="p-2 rounded-full hover:bg-wine/10 transition-colors"
            aria-label="Votar positivo"
          >
            <svg className="w-5 h-5 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          <span className="text-lg font-semibold text-wine">{comment.votes}</span>

          <button
            onClick={() => onVote(comment.id, false)}
            className="p-2 rounded-full hover:bg-wine/10 transition-colors"
            aria-label="Votar negativo"
          >
            <svg className="w-5 h-5 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3 text-sm text-wine/80">
            <span className="font-medium">{comment.author}</span>
            <span>•</span>
            <span>{formatDate(comment.createdAt)}</span>
          </div>

          <div className="text-textDark leading-relaxed">
            <p>{comment.content}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
  )
}
