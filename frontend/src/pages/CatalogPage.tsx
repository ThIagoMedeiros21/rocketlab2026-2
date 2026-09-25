import { FormEvent, useEffect, useState } from 'react'
import { fetchMovies } from '../data/api'
import type { MovieListItem, MovieListResponse } from '../types/movie'
import { MovieCard } from '../components/MovieCard'

function CatalogPage() {
  const [data, setData] = useState<MovieListResponse | null>(null)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true)
        setError(null)

        const result = await fetchMovies(page, 20, search)
        setData(result)
      } catch {
        setError('Não foi possível carregar os filmes.')
      } finally {
        setLoading(false)
      }
    }

    loadMovies()
  }, [page, search])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    setSearch(query)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b16] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_62%)]" />
      <div className="relative w-full px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
        <header className="mb-10 flex flex-col gap-8 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-lg font-black text-slate-950 shadow-lg shadow-amber-400/20">R</span>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-400">RocketLab Cinema</p>
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Histórias para assistir hoje.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              Explore o catálogo, encontre novos favoritos e descubra filmes que merecem sua próxima sessão.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-slate-300 backdrop-blur">
            <span className="block text-xs uppercase tracking-widest text-slate-500">Catálogo</span>
            <span className="mt-1 block text-2xl font-bold text-white">Em destaque</span>
          </div>
        </header>

        <form onSubmit={handleSearch} className="mb-10 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/20 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título..."
            className="w-full rounded-2xl border border-transparent bg-slate-950/70 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/70 focus:ring-4 focus:ring-amber-400/10"
          />

          <button
            type="submit"
            className="rounded-2xl bg-amber-400 px-8 py-4 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-400/20"
          >
            Buscar
          </button>
        </form>

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-[28rem] animate-pulse rounded-3xl bg-white/[0.06]" />
            ))}
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </p>
        )}

        {!loading && !error && data && (
          <>
            <div className="mb-5 flex items-center justify-between text-sm text-slate-400">
              <span><strong className="text-white">{data.total.toLocaleString('pt-BR')}</strong> filmes encontrados</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                Página {data.page} de {data.total_pages}
              </span>
            </div>

            {data.items.length === 0 ? (
              <p className="rounded-xl bg-slate-900 p-6 text-slate-400">
                Nenhum filme encontrado.
              </p>
            ) : (
              <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                {data.items.map((movie: MovieListItem) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </section>
            )}

            <nav className="mt-8 flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <button
                disabled={page === data.total_pages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
              </button>
            </nav>
          </>
        )}
      </div>
    </main>
  )
}

export default CatalogPage
