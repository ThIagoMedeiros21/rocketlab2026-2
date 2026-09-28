import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { fetchMovies, fetchGenres } from '../data/api'
import type { MovieListResponse } from '../types/movie'
import { MovieCard } from '../components/MovieCard'

function CatalogPage() {
  const [data, setData] = useState<MovieListResponse | null>(null)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  const [genres, setGenres] = useState<string[]>([])
  const [genre, setGenre] = useState('')
  const [genresLoading, setGenresLoading] = useState(true)
  const [genresError, setGenresError] = useState<string | null>(null)
  const [genresReload, setGenresReload] = useState(0)

  useEffect(() => {
    let active = true

    async function loadGenres() {
      setGenresLoading(true)
      setGenresError(null)

      try {
        const result = await fetchGenres()

        if (active) {
          setGenres(result)
        }
      } catch {
        if (active) {
          setGenresError('Não foi possível carregar os gêneros.')
        }
      } finally {
        if (active) {
          setGenresLoading(false)
        }
      }
    }

    void loadGenres()

    return () => {
      active = false
    }
  }, [genresReload])

  useEffect(() => {
    let active = true

    async function loadMovies() {
      setLoading(true)
      setError(null)

      try {
        const result = await fetchMovies(page, 20, search, genre)

        if (!active) return

        const lastPage = Math.max(1, result.total_pages)

        if (page > lastPage) {
          setPage(lastPage)
          return
        }

        setData(result)
      } catch {
        if (active) {
          setError('Não foi possível carregar os filmes.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadMovies()

    return () => {
      active = false
    }
  }, [page, search, genre, reload])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    setSearch(query.trim())
    setReload((value) => value + 1)
  }

  function handleGenreChange(value: string) {
    setPage(1)
    setGenre(value)
    setSearch(query.trim())
  }

  function clearFilters() {
    setQuery('')
    setSearch('')
    setGenre('')
    setPage(1)
    setReload((value) => value + 1)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b16] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_62%)]"
      />

      <div className="relative w-full px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
        <header className="mb-10 flex flex-col gap-8 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-lg font-black text-slate-950 shadow-lg shadow-amber-400/20">
                R
              </span>

              <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-400">
                RocketLab Cinema
              </p>
            </div>

            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Histórias para assistir hoje.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              Explore o catálogo, encontre novos favoritos e descubra
              filmes que merecem sua próxima sessão.
            </p>
          </div>

          <div className="self-start rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-slate-300 backdrop-blur">
            <Link
              to="/admin"
              className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-amber-400/30 hover:bg-amber-400/5 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-amber-400"
              >
                <path d="M12 3 4 6v5c0 5 4.5 8.5 8 10 3.5-1.5 8-5 8-10V6l-8-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>

              Administração
            </Link>
          </div>
        </header>

        <form
          onSubmit={handleSearch}
          className="mb-6 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/20 md:grid-cols-[minmax(0,1fr)_minmax(180px,240px)_auto]"
        >
          <label className="min-w-0">
            <span className="sr-only">
              Buscar pelo título do filme
            </span>

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título..."
              className="w-full rounded-2xl border border-transparent bg-slate-950/70 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/70 focus:ring-4 focus:ring-amber-400/10"
            />
          </label>

          <label className="min-w-0">
            <span className="sr-only">Filtrar por gênero</span>

            <select
              value={genre}
              disabled={genresLoading || genresError !== null}
              onChange={(event) =>
                handleGenreChange(event.target.value)
              }
              className="w-full rounded-2xl border border-transparent bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-amber-400/70 focus:ring-4 focus:ring-amber-400/10 disabled:opacity-50"
            >
              <option value="">
                {genresLoading
                  ? 'Carregando gêneros...'
                  : 'Todos os gêneros'}
              </option>

              {genres.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-2xl bg-amber-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
          >
            Buscar
          </button>
        </form>

        {genresError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200"
          >
            <p>
              {genresError} A pesquisa por título continua disponível.
            </p>

            <button
              type="button"
              onClick={() =>
                setGenresReload((value) => value + 1)
              }
              className="mt-2 font-semibold underline"
            >
              Tentar carregar novamente
            </button>
          </div>
        )}

        {(search || genre) && (
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-slate-400">Filtros ativos:</span>

            {search && (
              <span className="max-w-full break-words rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
                Título: {search}
              </span>
            )}

            {genre && (
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-300">
                {genre}
              </span>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="text-slate-400 underline underline-offset-4 hover:text-white"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {loading && (
          <div role="status">
            <span className="sr-only">Carregando filmes...</span>

            <div
              aria-hidden="true"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[28rem] animate-pulse rounded-3xl bg-white/[0.06]"
                />
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setReload((value) => value + 1)}
              className="mt-3 font-semibold underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <span role="status">
                <strong className="text-white">
                  {data.total.toLocaleString('pt-BR')}
                </strong>{' '}
                filmes encontrados
              </span>

              {data.total_pages > 0 && (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  Página {data.page} de {data.total_pages}
                </span>
              )}
            </div>

            {data.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
                <h2 className="text-lg font-semibold text-white">
                  Nenhum filme encontrado
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Tente outro título ou selecione outro gênero.
                </p>

                {(search || genre) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
                  >
                    Ver todos os filmes
                  </button>
                )}
              </div>
            ) : (
              <section
                aria-label="Filmes encontrados"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
              >
                {data.items.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </section>
            )}

            {data.total_pages > 0 && (
              <nav
                aria-label="Paginação do catálogo"
                className="mt-8 flex flex-wrap items-center justify-center gap-4"
              >
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={page >= data.total_pages}
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default CatalogPage