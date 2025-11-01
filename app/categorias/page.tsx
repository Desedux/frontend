"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Header from "@/components/Header"
import type { Category } from "@/lib/types"
import { getTags } from "@/lib/api/tags"

export default function CategoriasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const tags = await getTags()
        if (cancelled) return
        const mapped: Category[] = tags.map((t) => ({
          id: t.id,
          name: t.name,
          description: (t.description as unknown as string) || "",
          icon: t.image_url || t.name.charAt(0).toUpperCase(),
          color: "bg-gray-100",
          postCount: t.count,
        }))
        setCategories(mapped)
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar categorias")
        setCategories([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredCategories = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        (category.description || "").toLowerCase().includes(term),
    )
  }, [categories, searchTerm])

  return (
    <div className="min-h-screen bg-bgLight">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textDark mb-2">Categorias</h1>
          <p className="text-gray-600">Explore as discussões por categoria e encontre tópicos do seu interesse</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wine focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading && categories.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded" />
                  <div className="w-24 h-6 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-2/3 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 text-lg mb-2">Nenhuma categoria encontrada</p>
                  <p className="text-gray-400">Tente buscar com outros termos</p>
                </div>
              </div>
            )}

            <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-textDark mb-4">Estatísticas</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-wine">{categories.length}</p>
                  <p className="text-sm text-gray-600">Categorias</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-wine">
                    {categories.reduce((sum, cat) => sum + (cat.postCount || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total de Perguntas</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-wine">
                    {categories.length
                      ? Math.round(
                        categories.reduce((sum, cat) => sum + (cat.postCount || 0), 0) / categories.length,
                      )
                      : 0}
                  </p>
                  <p className="text-sm text-gray-600">Média por Categoria</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-wine">
                    {[...categories].sort((a, b) => (b.postCount || 0) - (a.postCount || 0))[0]?.name || "-"}
                  </p>
                  <p className="text-sm text-gray-600">Mais Popular</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function CategoryCard({ category }: { category: Category }) {
  const isUrl = typeof category.icon === "string" && /^https?:\/\//.test(category.icon)
  return (
    <Link href={`/categoria/${category.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`rounded-lg overflow-hidden inline-flex ${category.color}`}>
            {isUrl ? (
              <img
                src={category.icon}
                alt={category.name}
                className="block w-10 h-10 object-cover"
              />
            ) : (
              <span className="grid place-items-center w-10 h-10 text-2xl">
                {category.icon}
               </span>
            )}
          </div>
          <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium">
            {category.postCount} perguntas
          </span>
        </div>
        <h3 className="text-xl font-bold text-textDark mb-2">{category.name}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{category.description}</p>
      </div>
    </Link>
  )
}
