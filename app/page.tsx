"use client"

import {useEffect, useMemo, useState} from "react"
import Header from "@/components/Header"
import PostCard from "@/components/PostCard"
import type {Post} from "@/lib/types"
import {getCards, voteCard} from "@/lib/api/cards"
import {mapCardToPostVM} from "@/lib/mappers"

type FilterType = "relevant" | "recent" | "answered"

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("relevant")
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [votingIds, setVotingIds] = useState<Set<number>>(new Set())
  const [voteErrors, setVoteErrors] = useState<Record<number, string>>({})

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const cards = await getCards(page)
        const mapped = cards.map((c) => mapCardToPostVM(c))

        // merge sem duplicar
        setPosts((prev) => {
          const byId = new Map<number, Post>()
          ;[...prev, ...mapped].forEach((p) => byId.set(p.id, p))
          return Array.from(byId.values())
        })

        // se retornou menos que 20, não há mais páginas
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

    setVotingIds(prev => new Set(prev).add(postId))

    setPosts(prev =>
      prev.map(p => (p.id === postId ? {...p, votes: isUpvote ? p.votes + 1 : p.votes - 1} : p)),
    )

    try {
      await voteCard(String(postId), isUpvote)
      clearVoteError(postId)
    } catch (err: any) {
      console.error('Não foi possível registrar o voto:', err)
      let message: string
      const msg = err.message || ""
      if (msg.includes("Vote already recorded")) {
        message = `Você já deu ${voteType == 'up' ? "like" : "dislike"} nesse card.`
      }else if (msg.includes("Forbidden resource")){
        message = "Você precisa estar logado para votar."
      } else {
        message = "Não foi possível registrar seu voto. Tente novamente."
      }

      setVoteErrors(prev => ({...prev, [postId]: message}))

      setPosts(prev =>
        prev.map(p => (p.id === postId ? {...p, votes: isUpvote ? p.votes - 1 : p.votes + 1} : p)),
      )
      setTimeout(() => clearVoteError(postId), 3000)
    } finally {
      setVotingIds(prev => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }
  }

  const filteredPosts = useMemo(() => {
    const base = [...posts]
    switch (activeFilter) {
      case "answered":
        return base.filter((post) => post.officialResponse)
      case "recent":
        return base.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      default:
        return base.sort((a, b) => b.votes - a.votes)
    }
  }, [posts, activeFilter])

  return (
    <div className="min-h-screen bg-bgLight">
      <Header/>

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
              onClick={() => setActiveFilter("answered")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeFilter === "answered"
                  ? "bg-wine text-white"
                  : "bg-white text-textDark hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Respondidas por Wyden
            </button>
          </div>

          {/* Results count */}
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

        {/* Load more */}
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
    </div>
  )
}
