import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import {
  deleteMovie,
  fetchMovie,
  fetchMovies,
  updateMovie,
} from '../data/api'

import type {
  MovieDetail,
  MovieListItem,
  MovieListResponse,
} from '../types/movie'

type MovieManageListProps = {
  token: string
}

const inputClasses =
  'w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400'

const buttonClasses =
  'rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40'

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Ocorreu um erro. Tente novamente.'
}

type MovieEditFormProps = {
  movie: MovieDetail
  token: string
  onSaved: () => void
  onCancel: () => void
}

function MovieEditForm({
  movie,
  token,
  onSaved,
  onCancel,
}: MovieEditFormProps) {
  const [titulo, setTitulo] = useState(movie.titulo)
  const [ano, setAno] = useState(
    movie.ano_lancamento?.toString() ?? '',
  )
  const [sinopse, setSinopse] = useState(movie.sinopse ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    setError(null)

    if (!titulo.trim()) {
      setError('Informe o título do filme.')
      return
    }

    const year = ano.trim() ? Number(ano) : null

    if (
      year !== null &&
      (!Number.isInteger(year) || year < 1 || year > 9999)
    ) {
      setError('Informe um ano inteiro entre 1 e 9999.')
      return
    }

    setSaving(true)

    try {
      await updateMovie(
        movie.id,
        {
          titulo: titulo.trim(),
          ano_lancamento: year,
          sinopse: sinopse.trim() || null,
        },
        token,
      )
    } catch (cause) {
      setError(errorMessage(cause))
      setSaving(false)
      return
    }

    setSaving(false)
    onSaved()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 border-t border-white/10 pt-5"
    >
      <fieldset disabled={saving} className="space-y-4">
        <legend className="sr-only">
          Editar {movie.titulo}
        </legend>

        <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              Título
            </span>
            <input
              required
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              className={inputClasses}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              Ano
            </span>
            <input
              type="number"
              min={1}
              max={9999}
              step={1}
              value={ano}
              onChange={(event) => setAno(event.target.value)}
              className={inputClasses}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">
            Sinopse
          </span>
          <textarea
            rows={5}
            value={sinopse}
            onChange={(event) => setSinopse(event.target.value)}
            className={`${inputClasses} resize-y`}
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className={buttonClasses}
          >
            Cancelar
          </button>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  )
}

export default function MovieManageList({
  token,
}: MovieManageListProps) {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [data, setData] = useState<MovieListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [editing, setEditing] = useState<MovieDetail | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const locked = loading || busyId !== null || editing !== null

  useEffect(() => {
    let active = true

    async function loadMovies() {
      setLoading(true)
      setError(null)

      try {
        const result = await fetchMovies(page, 10, search)

        if (!active) return

        // Se a última linha de uma página foi excluída,
        // retorna para uma página que ainda tenha resultados.
        const lastPage = Math.max(1, result.total_pages)

        if (page > lastPage) {
          setPage(lastPage)
          return
        }

        setData(result)
      } catch (cause) {
        if (active) {
          setData(null)
          setError(errorMessage(cause))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadMovies()

    return () => {
      active = false
    }
  }, [page, search, reload])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (locked) return

    setNotice(null)
    setPage(1)
    setSearch(query.trim())
    setReload((value) => value + 1)
  }

  async function handleEdit(movie: MovieListItem) {
    if (locked) return

    setBusyId(movie.id)
    setError(null)
    setNotice(null)

    try {
      const detail = await fetchMovie(movie.id)
      setEditing(detail)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(movie: MovieListItem) {
    if (locked) return

    const confirmed = window.confirm(
      `Excluir "${movie.titulo}"? Esta ação não pode ser desfeita.`,
    )

    if (!confirmed) return

    setBusyId(movie.id)
    setError(null)
    setNotice(null)

    try {
      await deleteMovie(movie.id, token)
      setNotice(`"${movie.titulo}" foi excluído.`)
      setReload((value) => value + 1)
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
      <h2 className="text-xl font-bold">Gerenciar filmes</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Busque pelo título para consultar, editar ou excluir um filme.
      </p>

      <form
        onSubmit={handleSearch}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Buscar filme pelo título</span>
          <input
            type="search"
            value={query}
            disabled={locked}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título..."
            className={inputClasses}
          />
        </label>

        <button
          type="submit"
          disabled={locked}
          className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-40"
        >
          Buscar
        </button>
      </form>

      {notice && (
        <p
          role="status"
          className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300"
        >
          {notice}
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
        >
          <p>{error}</p>
          <button
            type="button"
            disabled={locked}
            onClick={() => setReload((value) => value + 1)}
            className="mt-3 underline disabled:opacity-40"
          >
            Atualizar listagem
          </button>
        </div>
      )}

      {loading ? (
        <p role="status" className="py-10 text-slate-400">
          Carregando filmes...
        </p>
      ) : data ? (
        <>
          <p className="my-5 text-sm text-slate-400">
            {data.total.toLocaleString('pt-BR')} filme(s) encontrado(s)
          </p>

          <div className="space-y-3">
            {data.items.map((movie) => (
              <article
                key={movie.id}
                className="rounded-2xl border border-white/10 bg-black/10 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      to={`/movies/${movie.id}`}
                      className="break-words font-semibold text-white hover:text-amber-300"
                    >
                      {movie.titulo}
                    </Link>

                    <p className="mt-1 text-sm text-slate-400">
                      {movie.ano_lancamento ?? 'Ano não informado'}
                      {movie.generos.length > 0 &&
                        ` · ${movie.generos.join(', ')}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => void handleEdit(movie)}
                      className={buttonClasses}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => void handleDelete(movie)}
                      className={`${buttonClasses} border-red-400/20 text-red-300 hover:bg-red-400/10`}
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {busyId === movie.id && (
                  <p role="status" className="mt-3 text-sm text-amber-300">
                    Processando...
                  </p>
                )}

                {editing?.id === movie.id && (
                  <MovieEditForm
                    key={editing.id}
                    movie={editing}
                    token={token}
                    onCancel={() => setEditing(null)}
                    onSaved={() => {
                      setEditing(null)
                      setNotice('Filme atualizado com sucesso.')
                      setReload((value) => value + 1)
                    }}
                  />
                )}
              </article>
            ))}
          </div>

          {data.items.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400">
              Nenhum filme encontrado.
            </p>
          )}

          {data.total_pages > 0 && (
            <nav
              aria-label="Paginação dos filmes"
              className="mt-6 flex flex-wrap items-center justify-between gap-4"
            >
              <span className="text-sm text-slate-400">
                Página {data.page} de {data.total_pages}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={locked || page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                  className={buttonClasses}
                >
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={locked || page >= data.total_pages}
                  onClick={() => setPage((value) => value + 1)}
                  className={buttonClasses}
                >
                  Próxima
                </button>
              </div>
            </nav>
          )}
        </>
      ) : null}
    </section>
  )
}