"use client"

import React, {useRef} from "react"
import {useEffect, useState} from "react"
import {useParams} from "next/navigation"
import Header from "@/components/Header"
import CommentThread from "@/components/CommentThread"
import OfficialResponseComment from "@/components/OfficialResponseComment"
import type {Post, Comment} from "@/lib/types"
import {getCardById, voteCard} from "@/lib/api/cards"
import {listComments, createComment, setReaction} from "@/lib/api/commentary"
import type {CommentResponseDto} from "@/lib/api/types"
import {openLoginModal} from "@/lib/ui";

function mapComment(dto: CommentResponseDto): Comment {
  const votes =
    (dto as any).up_down != null
      ? (dto as any).up_down
      : (dto as any).likesCount || (dto as any).dislikesCount
        ? ((dto as any).likesCount || 0) - ((dto as any).dislikesCount || 0)
        : 0

  return {
    id: Number(dto.id),
    content: dto.content,
    author: dto.author,
    isAnonymous: false,
    createdAt: (dto as any).created_at,
    votes,
    isOfficial: Boolean((dto as any).is_official ?? (dto as any).isOfficial ?? false),
    replies: [], // árvore montada depois
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const postId = Number.parseInt(params.id as string)

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadingComments, setLoadingComments] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authWarning, setAuthWarning] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const card = await getCardById(String(postId))
        if (cancelled) return
        const mapped: Post = {
          id: card.id,
          title: card.title,
          content: card.description,
          author: card.author,
          isAnonymous: false,
          createdAt: card.created_at,
          votes: card.up_down,
          commentCount: 0,
          tags: [],
          category: "",
          officialResponse: false,
        }
        setPost(mapped)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Erro ao carregar card")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [postId])

  function buildCommentTree(rows: CommentResponseDto[]): Comment[] {
    const nodes = new Map<number, Comment>()
    rows.forEach((dto) => { nodes.set(Number(dto.id), mapComment(dto)) })

    const roots: Comment[] = []
    rows.forEach((dto) => {
      const id = Number(dto.id)
      const pidRaw = (dto as any).parent_id ?? (dto as any).parentId ?? null
      const pid = pidRaw == null ? null : Number(pidRaw)
      const node = nodes.get(id)!
      if (pid == null) roots.push(node)
      else {
        const parent = nodes.get(pid)
        if (parent) parent.replies.push(node)
        else roots.push(node)
      }
    })

    const sortByDate = (a: Comment, b: Comment) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

    const sortRec = (arr: Comment[]) => {
      arr.sort(sortByDate)
      arr.forEach((c) => sortRec(c.replies))
    }
    sortRec(roots)
    return roots
  }

  const cancelledRef = useRef(false)

  async function loadComments() {
    setLoadingComments(true)
    try {
      const resp = await listComments(postId, { page: 1, limit: 50 })
      if (cancelledRef.current) return

      const flat = (resp.data || []) as CommentResponseDto[]
      const tree = buildCommentTree(flat)
      setComments(tree)
      setPost((p) => (p ? { ...p, commentCount: resp.total ?? flat.length } : p))
    } catch {
      setComments([])
    } finally {
      if (!cancelledRef.current) setLoadingComments(false)
    }
  }

  useEffect(() => {
    cancelledRef.current = false
    void loadComments()
    return () => { cancelledRef.current = true }
  }, [postId])

  // Like do CARD mantido
  const handleVote = async (postIdNum: number, voteType: "up" | "down") => {
    if (!post) return
    setPost((prev) =>
      prev ? { ...prev, votes: voteType === "up" ? prev.votes + 1 : prev.votes - 1 } : null,
    )
    voteCard(String(postIdNum), voteType === "up").catch(() => {
      setPost((prev) =>
        prev ? { ...prev, votes: voteType === "up" ? prev.votes - 1 : prev.votes + 1 } : null,
      )
    })
  }

  function updateCommentVotesTree(
    items: Comment[],
    commentId: number,
    delta: number,
  ): Comment[] {
    return items.map((c) => {
      if (c.id === commentId) {
        return { ...c, votes: c.votes + delta }
      }
      if (c.replies && c.replies.length) {
        return { ...c, replies: updateCommentVotesTree(c.replies, commentId, delta) }
      }
      return c
    })
  }

  const handleCommentVote = async (commentId: number, voteType: boolean) => {
    setComments(prevList =>
      updateCommentVotesTree(prevList, commentId, voteType ? 1 : -1),
    )

    try {
      await setReaction(`${postId}`, `${commentId}`, voteType)
    } catch (err: any) {
      console.log("A mensagem de erro do voto do comentário é " + err.message)
      const msg = err?.message || ""

      if (msg.includes("Forbidden resource")) {
        setAuthWarning("Você precisa estar logado para votar em comentários.")
      }

      setComments(prevList =>
        updateCommentVotesTree(prevList, commentId, voteType ? -1 : 1),
      )
    }
  }

  function insertReply(items: Comment[], parentId: number, reply: Comment): Comment[] {
    return items.map((c) => {
      if (c.id === parentId) return { ...c, replies: [...c.replies, reply] }
      if (c.replies?.length) return { ...c, replies: insertReply(c.replies, parentId, reply) }
      return c
    })
  }

  const handleReply = async (parentId: number, replyContent: string) => {
    if (!replyContent.trim()) return
    try {
      const created = await createComment(postId, {content: replyContent, parentId})
      const reply: Comment = mapComment(created)
      setComments((prev) => insertReply(prev, parentId, reply))
      setPost((p) => (p ? {...p, commentCount: p.commentCount + 1} : p))
    } catch {}
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setAuthWarning(null)
    try {
      const created = await createComment(postId, {content: newComment, parentId: null})
      const c: Comment = mapComment(created)
      setComments((prev) => [...prev, c])
      setNewComment("")
      setPost((p) => (p ? {...p, commentCount: p.commentCount + 1} : p))
    } catch (err: any) {
      if (err?.message?.includes('Forbidden resource')) {
        setAuthWarning("Para comentar, você precisa estar logado.")
        return
      }
      setAuthWarning("Não foi possível publicar o comentário. Tente novamente.")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  const officialComments = comments.filter((c) => c.isOfficial)
  const regularComments = comments.filter((c) => !c.isOfficial)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bgLight">
        <Header/>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-bgLight">
        <Header/>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-textDark mb-4">Pergunta não encontrada</h1>
            <p className="text-gray-600 mb-6">{error || "A pergunta que você está procurando não existe ou foi removida."}</p>
            <a href="/" className="btn-primary">Voltar ao início</a>
          </div>
        </main>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-bgLight">
      <Header/>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <nav className="mb-6">
          <a href="/" className="text-wine hover:text-wine/80 transition-colors">← Voltar para perguntas</a>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex flex-col items-center space-y-2 min-w-[60px]">
              <button
                onClick={() => handleVote(post.id, "up")}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Votar positivo"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
                </svg>
              </button>
              <span className="text-xl font-semibold text-textDark">{post.votes}</span>
              <button
                onClick={() => handleVote(post.id, "down")}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Votar negativo"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-textDark pr-4">{post.title}</h1>
                {post.officialResponse && (
                  <span className="bg-wine/10 text-wine px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                    Resposta Oficial
                  </span>
                )}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{post.content}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span>Por: {post.isAnonymous ? "Anônimo" : post.author}</span>
                  <span>{formatDate(post.createdAt)}</span>
                  <span>Categoria: {post.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-textDark">Comentários ({comments.length})</h2>

          {officialComments.map((comment) => (
            <OfficialResponseComment
              key={comment.id}
              comment={comment}
              onVote={(id, dir) => handleCommentVote(id, dir)}
            />
          ))}

          {regularComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              onVote={(id, dir) => handleCommentVote(id, dir)}
              onReply={handleReply}
            />
          ))}

          {loadingComments && comments.length === 0 && (
            <div className="text-center py-8 text-gray-500">Carregando comentários...</div>
          )}

          {!loadingComments && comments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Ainda não há comentários. Seja o primeiro a comentar!</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-textDark mb-4">Adicionar Comentário</h3>
            <form onSubmit={handleSubmitComment}>
              {authWarning && (
                <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-800">
                  {authWarning}{" "}
                  <button type="button" onClick={() => openLoginModal()} className="underline font-medium">
                    Fazer login
                  </button>
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva seu comentário..."
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-wine focus:border-transparent"
                rows={4}
                required
              />
              <div className="flex justify-end mt-4">
                <button type="submit" className="btn-primary" disabled={!newComment.trim()}>
                  Publicar Comentário
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
