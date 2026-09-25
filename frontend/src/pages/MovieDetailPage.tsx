import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchMovie } from '../data/api'
import type { MovieDetail } from '../types/movie'

export default function MovieDetailPage() {
  const { movieId } = useParams<{ movieId: string }>()
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!movieId) return

    fetchMovie(movieId)
      .then(setMovie)
      .catch(() => setError('Não foi possível carregar o filme.'))
      .finally(() => setLoading(false))
  }, [movieId])

  if (loading) {
    return <main className="min-h-screen bg-[#070b16] p-8 text-white">Carregando...</main>
  }

  if (error || !movie) {
    return (
      <main className="min-h-screen bg-[#070b16] p-8 text-white">
        <p className="text-red-300">{error ?? 'Filme não encontrado.'}</p>
        <Link to="/" className="mt-4 inline-block text-amber-400">
          Voltar ao catálogo
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#070b16] px-4 py-8 text-white sm:px-8 lg:px-16">
      <Link to="/" className="text-sm text-amber-400 hover:text-amber-300">
        ← Voltar ao catálogo
      </Link>

      <section className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <img
          src={movie.url_poster || '/placeholder-poster.svg'}
          alt={`Pôster de ${movie.titulo}`}
          className="w-full rounded-3xl object-cover shadow-2xl"
        />

        <div>
          <p className="text-sm uppercase tracking-widest text-amber-400">
            {movie.ano_lancamento ?? 'Ano desconhecido'}
          </p>

          <h1 className="mt-2 text-4xl font-black sm:text-5xl">
            {movie.titulo}
          </h1>

          <p className="mt-6 max-w-3xl leading-7 text-slate-300">
            {movie.sinopse || 'Sinopse não disponível.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {movie.generos.map((genero) => (
              <span
                key={genero}
                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-slate-300"
              >
                {genero}
              </span>
            ))}
          </div>

          <p className="mt-6 text-amber-400">
            ★ {movie.nota_media?.toFixed(1) ?? 'Sem avaliações'}
          </p>
        </div>
      </section>
    </main>
  )
}