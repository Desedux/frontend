"use client"

import {useEffect, useMemo, useState} from "react"
import Header from "@/components/Header"
import PostCard from "@/components/PostCard"
import type {Post} from "@/lib/types"
import {getCards, voteCard, deleteCard} from "@/lib/api/cards"
import {mapCardToPostVM} from "@/lib/mappers"
import {useAuth} from "@/contexts/AuthContext";

type FilterType = "relevant" | "recent" | "answered" | "my answered"

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("recent")
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [votingIds, setVotingIds] = useState<Set<number>>(new Set())
  const [voteErrors, setVoteErrors] = useState<Record<number, string>>({})

  // estado de deleção
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const cards = await getCards(page)
        const mapped = cards.map((c) => mapCardToPostVM(c))

        setPosts((prev) => {
          const byId = new Map<number, Post>()
          ;[...prev, ...mapped].forEach((p) => byId.set(p.id, p))
          return Array.from(byId.values())
        })

        setHasMore(cards.length >= 20)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Erro ao carregar posts")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [page])

  function clearVoteError(postId: number) {
    setVoteErrors(prev => {
      const {[postId]: _, ...rest} = prev
      return rest
    })
  }

  async function handleVote(postId: number, voteType: "up" | "down") {
    if (votingIds.has(postId)) return
    const isUpvote = voteType === "up"

    const prevPosts = posts

    setVotingIds(prev => new Set(prev).add(postId))

    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p

        const currentUserVote = p.userVote ?? 0
        let newUserVote: number

        if (isUpvote) {
          if (currentUserVote === 1) newUserVote = 0
          else if (currentUserVote === 0) newUserVote = 1
          else newUserVote = 0
        } else {
          if (currentUserVote === -1) newUserVote = 0
          else if (currentUserVote === 0) newUserVote = -1
          else newUserVote = 0
        }

        const delta = newUserVote - currentUserVote

        return {
          ...p,
          votes: p.votes + delta,
          userVote: newUserVote,
        }
      }),
    )

    try {
      await voteCard(String(postId), isUpvote)
      clearVoteError(postId)
    } catch (err: any) {
      console.error("Não foi possível registrar o voto:", err)
      const msg = err?.message || ""
      let message: string

      if (msg.includes("Vote already recorded")) {
        message = `Você já deu ${voteType === "up" ? "like" : "dislike"} nesse card.`
      } else if (msg.includes("Forbidden resource") || msg.includes("Unauthorized")) {
        message = "Você precisa estar logado para votar."
      } else {
        message = "Não foi possível registrar seu voto. Tente novamente."
      }

      setVoteErrors(prev => ({ ...prev, [postId]: message }))
      setPosts(prevPosts)
      setTimeout(() => clearVoteError(postId), 3000)
    } finally {
      setVotingIds(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }
  }

  function handlePostCreated(card: any) {
    const mapped = mapCardToPostVM(card)

    setPosts(prev => {
      if (prev.some(p => p.id === mapped.id)) return prev
      return [mapped, ...prev]
    })
  }

  // abrir modal de deleção
  function handleAskDelete(postId: number) {
    setDeleteTargetId(postId)
    setDeleteError(null)
  }

  function handleCancelDelete() {
    if (isDeleting) return
    setDeleteTargetId(null)
    setDeleteError(null)
  }

  async function handleConfirmDelete() {
    if (deleteTargetId == null) return

    const postId = deleteTargetId
    const previousPosts = posts

    setIsDeleting(true)
    setDeleteError(null)

    // otimista: remove da lista
    setPosts(prev => prev.filter(p => p.id !== postId))

    try {
      await deleteCard(String(postId))
      setDeleteTargetId(null)
    } catch (err: any) {
      console.error("Erro ao deletar card:", err)
      const msg = err?.message || ""

      let message: string
      if (msg.includes("Forbidden")) {
        message = "Você só pode excluir cards que você criou."
      } else if (msg.includes("Unauthorized")) {
        message = "Você precisa estar logado para excluir um card."
      } else if (msg.includes('Card not found')) {
        message = "Este card já foi excluído."
      } else {
        message = "Não foi possível excluir este card. Tente novamente."
      }

      setDeleteError(message)
      // rollback
      setPosts(previousPosts)
    } finally {
      setIsDeleting(false)
    }
  }

  const { user } = useAuth()

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
  const currentUserUid = extractUidFromToken(user?.tokens.idToken)

  const filteredPosts = useMemo(() => {
    const base = [...posts]
    switch (activeFilter) {
      case "recent":
        return base.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "my answered":
        return base.filter(post => post.userUid == currentUserUid)
      default:
        return base.sort((a, b) => b.votes - a.votes)
    }
  }, [posts, activeFilter])

  return (
    <div className="min-h-screen bg-bgLight">
      <Header onPostCreated={handlePostCreated} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textDark mb-2">Perguntas da Comunidade</h1>
          <p className="text-gray-600">Participe das discussões e acompanhe as respostas oficiais</p>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setActiveFilter("relevant")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === "relevant"
                  ? "bg-wine text-white"
                  : "bg-white text-textDark hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Mais Relevantes
            </button>
            <button
              onClick={() => setActiveFilter("recent")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === "recent"
                  ? "bg-wine text-white"
                  : "bg-white text-textDark hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Mais Recentes
            </button>
            <button
              onClick={() => setActiveFilter("my answered")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === "my answered"
                  ? "bg-wine text-white"
                  : "bg-white text-textDark hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Meus Cards
            </button>
          </div>

          <p className="text-sm text-gray-600">
            {filteredPosts.length} pergunta{filteredPosts.length !== 1 ? "s" : ""} encontrada
            {filteredPosts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading && posts.length === 0 && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-3"/>
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-5"/>
                <div className="h-24 w-full bg-gray-100 rounded"/>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onVote={handleVote}
              error={voteErrors[post.id]}
              voting={votingIds.has(post.id)}
              onDismissError={() => clearVoteError(post.id)}
              onDelete={() => handleAskDelete(post.id)}
              userUid={currentUserUid}
            />
          ))}
        </div>

        {filteredPosts.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.4a7.962 7.962 0 01-5-1.691c-2.598-2.11-3-4.57-3-5.5 0-1.125.266-2.427 1-3.5A6.963 6.963 0 0112 6.4c2.014 0 3.875.82 5 2.1.734 1.073 1 2.375 1 3.5 0 .93-.402 3.39-3 5.5z"
                />
              </svg>
              <p className="text-gray-500 text-lg mb-2">Nenhuma pergunta encontrada</p>
              <p className="text-gray-400">Tente ajustar os filtros ou seja o primeiro a fazer uma pergunta</p>
            </div>
          </div>
        )}

        <div className="flex justify-center py-10">
          <button
            disabled={loading || !hasMore}
            onClick={() => setPage((p) => p + 1)}
            className={`px-6 py-2 rounded-lg border text-sm ${
              loading || !hasMore
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-textDark hover:bg-gray-50 border-gray-200"
            }`}
          >
            {loading ? "Carregando..." : hasMore ? "Carregar mais" : "Não há mais resultados"}
          </button>
        </div>
      </main>

      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm w-full mx-4 p-6">
            <h4 className="text-lg font-semibold text-textDark mb-2">
              Excluir pergunta?
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Tem certeza que deseja excluir este card? Essa ação não pode ser desfeita.
            </p>

            {deleteError && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
