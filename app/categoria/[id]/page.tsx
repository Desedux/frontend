"use client"

import {useEffect, useMemo, useState} from "react"
import {useParams} from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"
import PostCard from "@/components/PostCard"
import type {Post} from "@/lib/types"
import {getTags} from "@/lib/api/tags"
import {getCardsByCategory, voteCard} from "@/lib/api/cards"
import {mapCardToPostVM} from "@/lib/mappers"

type SortKind = "recent" | "popular"

type CategoryView = {
  id: number
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

export default function CategoryPage() {
  const params = useParams()
  const categoryId = Number(params.id)
  const [votingIds, setVotingIds] = useState<Set<number>>(new Set())
  const [voteErrors, setVoteErrors] = useState<Record<number, string>>({})

  const [categories, setCategories] = useState<CategoryView[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [sortBy, setSortBy] = useState<SortKind>("recent")
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [tagIndex, setTagIndex] = useState<Map<number, string>>(new Map())

  useEffect(() => {
    let cancelled = false

    async function loadTags() {
      setLoadingCategories(true)
      try {
        const tags = await getTags()
        if (cancelled) return
        const idx = new Map<number, string>(tags.map((t: any) => [t.id, t.name]))
        setTagIndex(idx)
        const mapped: CategoryView[] = tags.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description ?? "",
          icon: t.image_url ? (
            <img src={t.image_url} alt={t.name} className="w-10 h-10 object-cover rounded"/>
          ) : (
            t.name.charAt(0).toUpperCase()
          ),
          color: "bg-gray-100",
        }))
        setCategories(mapped)
      } catch {
        setCategories([])
      } finally {
        if (!cancelled) setLoadingCategories(false)
      }
    }

    loadTags()
    return () => {
      cancelled = true
    }
  }, [])

  const category = useMemo(
    () => categories.find((cat) => cat.id === categoryId),
    [categories, categoryId],
  )

  useEffect(() => {
    let cancelled = false

    async function loadFirstPage() {
      setPosts([])
      setPage(1)
      setHasMore(true)
      setLoadingMore(true)
      try {
        const data = await getCardsByCategory(categoryId, 1)
        if (cancelled) return
        const mapped = data.map((c: any) => mapCardToPostVM(c, tagIndex))
        setPosts(mapped)
        setHasMore(data.length === 20)
      } catch {
        setPosts([])
        setHasMore(false)
      } finally {
        if (!cancelled) setLoadingMore(false)
      }
    }

    if (Number.isFinite(categoryId)) {
      loadFirstPage()
    }
    return () => {
      cancelled = true
    }
  }, [categoryId]) // carrega primeira página ao trocar de categoria

  useEffect(() => {
    if (!posts.length) return
    setPosts(prev => prev.map(p => ({...p})))
  }, [tagIndex])

  async function handleLoadMore() {
    if (!hasMore || loadingMore) return
    const next = page + 1
    setLoadingMore(true)
    try {
      const data = await getCardsByCategory(categoryId, next)
      const mapped = data.map((c: any) => mapCardToPostVM(c, tagIndex))
      setPosts(prev => [...prev, ...mapped])
      setPage(next)
      setHasMore(data.length === 20)
    } finally {
      setLoadingMore(false)
    }
  }

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
      console.log("A mensagem de erro do voto é " + err.message)
      let message: string
      const msg = err.message || ""
      if (msg.includes("Vote already recorded")) {
        message = "Você já votou nesta pergunta."
      }else if (msg.includes("Forbidden resource")){
        message = "Você precisa estar logado para votar."
      } else {
        message = "Não foi possível registrar seu voto. Tente novamente."
      }

      void setVoteErrors(prev => ({...prev, [postId]: message}))

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

  const sortedPosts = useMemo(() => {
    const arr = [...posts]
    if (sortBy === "popular") return arr.sort((a, b) => b.votes - a.votes)
    return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [posts, sortBy])

  if (!loadingCategories && !category) {
    return (
      <div className="min-h-screen bg-bgLight">
        <Header/>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-textDark mb-4">Categoria não encontrada</h1>
            <Link href="/categorias" className="text-wine hover:underline">
              Voltar para categorias
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bgLight">
      <Header/>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/categorias" className="text-wine hover:underline mb-4 inline-block">
            ← Voltar para categorias
          </Link>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center ${
                  category?.color || "bg-gray-100"
                }`}
              >
                {category?.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-textDark mb-2">{category?.name || "Carregando..."}</h1>
                <p className="text-gray-600">{category?.description || ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                </svg>
                <span>{posts.length} perguntas</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <span>{posts.filter(p => p.officialResponse).length} respostas oficiais</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-textDark">Perguntas</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("recent")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === "recent" ? "bg-wine text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Mais Recentes
            </button>
            <button
              onClick={() => setSortBy("popular")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === "popular" ? "bg-wine text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Mais Populares
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sortedPosts.length > 0 ? (
            sortedPosts.map(post => <PostCard
              key={post.id}
              post={post}
              onVote={handleVote}
              error={voteErrors[post.id]}
              voting={votingIds.has(post.id)}
              onDismissError={() => clearVoteError(post.id)}
            />)
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor"
                   viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <p className="text-gray-500 text-lg mb-2">Nenhuma pergunta ainda</p>
              <p className="text-gray-400">Seja o primeiro a fazer uma pergunta nesta categoria</p>
            </div>
          )}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-6 py-3 bg-wine text-white rounded-lg font-medium hover:bg-wine/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loadingMore ? "Carregando..." : "Carregar mais"}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
