import { FormEvent, useEffect, useState } from 'react'
import { fetchMovies } from './services/api'
import type { MovieListItem, MovieListResponse } from './types/movie'

function App() {
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
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
            RocketLab Cinema
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            Catálogo de filmes
          </h1>

          <p className="mt-3 text-slate-400">
            Encontre seu próximo filme favorito.
          </p>
        </header>

        <form onSubmit={handleSearch} className="mb-8 flex gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none transition focus:border-amber-400"
          />

          <button
            type="submit"
            className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Buscar
          </button>
        </form>

        {loading && (
          <p className="text-slate-400">Carregando filmes...</p>
        )}

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </p>
        )}

        {!loading && !error && data && (
          <>
            <div className="mb-5 flex items-center justify-between text-sm text-slate-400">
              <span>{data.total} filmes encontrados</span>
              <span>
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
                  <article
                    key={movie.id}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg"
                  >
                    <img
                        src={movie.url_poster || "/placeholder-poster.svg"}
                        alt={`Pôster de ${movie.titulo}`}
                        className="h-80 w-full object-cover"
                      />

                    <div className="p-4">
                      <h2 className="line-clamp-2 font-semibold">
                        {movie.titulo}
                      </h2>

                      <p className="mt-2 text-sm text-slate-400">
                        {movie.ano_lancamento ?? 'Ano desconhecido'}
                      </p>

                      <p className="mt-2 text-sm text-amber-400">
                        ★ {movie.nota_media?.toFixed(1) ?? 'Sem avaliações'}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {movie.generos.map((genero) => (
                          <span
                            key={genero}
                            className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300"
                          >
                            {genero}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}

            <nav className="mt-8 flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg bg-slate-800 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <button
                disabled={page === data.total_pages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg bg-slate-800 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
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

export default App