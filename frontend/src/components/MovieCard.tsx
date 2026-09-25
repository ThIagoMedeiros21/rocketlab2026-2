import type { MovieListItem } from '../types/movie'
import { Link } from 'react-router-dom'
type MovieCardProps = {
  movie: MovieListItem
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
  <Link
    to={`/movies/${movie.id}`}
    className="block"
  >
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-950/30">
      <img
        src={movie.url_poster || '/placeholder-poster.svg'}
        alt={`Pôster de ${movie.titulo}`}
        className="h-80 w-full object-cover transition duration-500 group-hover:scale-105"
      />

      <div className="p-4">
        <h2 className="line-clamp-2 min-h-12 text-lg font-bold leading-6 text-white">
          {movie.titulo}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {movie.ano_lancamento ?? 'Ano desconhecido'}
        </p>

        <p className="mt-3 text-sm font-semibold text-amber-400">
          ★ {movie.nota_media?.toFixed(1) ?? 'Sem avaliações'}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {movie.generos.map((genero) => (
            <span
              key={genero}
              className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs text-slate-300"
            >
              {genero}
            </span>
          ))}
        </div>
      </div>
    </article>
  </Link>
)
}
