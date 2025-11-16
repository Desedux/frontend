"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getTags } from "@/lib/api/tags"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (postData: {
    title: string
    content: string
    category: string
    isAnonymous: boolean
  }) => Promise<void>
}

interface TagOption {
  id: number
  name: string
}

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [categories, setCategories] = useState<TagOption[]>([])

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    const loadCategories = async () => {
      try {
        const tags = await getTags()
        if (!cancelled) {
          setCategories(tags.map((t: any) => ({ id: t.id, name: t.name })))
        }
      } catch {
        if (!cancelled) {
          setCategories([])
        }
      }
    }

    void loadCategories()

    return () => {
      cancelled = true
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !category) return

    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      isAnonymous,
    })

    setTitle("")
    setContent("")
    setCategory("")
    setIsAnonymous(false)
    onClose()
  }

  const handleClose = () => {
    setTitle("")
    setContent("")
    setCategory("")
    setIsAnonymous(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-textDark">Nova Pergunta</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar modal"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-textDark mb-2">
              Título da Pergunta *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da sua pergunta..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
              required
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/200 caracteres</p>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-textDark mb-2">
              Categoria *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-textDark mb-2">
              Descrição *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva sua pergunta em detalhes..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-wine focus:border-transparent"
              rows={6}
              required
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/2000 caracteres</p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-wine bg-gray-100 border-gray-300 rounded focus:ring-wine focus:ring-2"
            />
            <label htmlFor="anonymous" className="ml-2 text-sm text-textDark">
              Publicar como anônimo
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!title.trim() || !content.trim() || !category}
            >
              Publicar Pergunta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
