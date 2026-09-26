import { Link } from 'react-router-dom'
import type { MovieListItem } from '../types/movie'

type MovieCardProps = {
  movie: MovieListItem
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="h-full">
      <Link
        to={`/movies/${movie.id}`}
        aria-label={`Ver detalhes de ${movie.titulo}`}
        className="group flex h-full flex-col rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0b0d12]"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-[#171b24] shadow-lg shadow-black/20">
          <img
            src={movie.url_poster || '/placeholder-poster.svg'}
            alt={`Pôster de ${movie.titulo}`}
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = '/placeholder-poster.svg'
            }}
            className="h-full w-full object-cover transition duration-500 motion-safe:group-hover:scale-105"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          <span className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-semibold text-white">
            Ver detalhes
            <span
              aria-hidden="true"
              className="transition-transform motion-safe:group-hover:translate-x-1"
            >
              ↗
            </span>
          </span>
        </div>

        <div className="flex flex-1 flex-col px-1 pt-4">
          <p className="text-xs font-medium text-slate-400">
            {movie.ano_lancamento ?? 'Ano não informado'}
          </p>

          <h3 className="mt-1.5 line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-100 transition group-hover:text-amber-300">
            {movie.titulo}
          </h3>

          <p className="mt-2 truncate text-xs leading-5 text-slate-400">
            {movie.generos.length
              ? movie.generos.join(' · ')
              : 'Gênero não informado'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/10 pt-3">
            <span aria-hidden="true" className="text-amber-400">
              ★
            </span>

            {movie.nota_media !== null ? (
              <>
                <span className="text-sm font-bold tabular-nums text-white">
                  {movie.nota_media.toFixed(1)}
                  <span className="ml-1 text-xs font-normal text-slate-500">
                    / 10
                  </span>
                </span>

                <span className="text-xs text-slate-400">
                  Comunidade
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400">
                Sem avaliações
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}