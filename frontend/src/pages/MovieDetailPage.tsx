import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchMovie } from '../data/api'
import type { MovieDetail } from '../types/movie'

function PeopleGroup({ title, people }: { title: string; people: string[] }) {
  if (!people.length) return null

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{title}</h3>
      <p className="mt-2 leading-7 text-slate-300">{people.join(' · ')}</p>
    </div>
  )
}

export default function MovieDetailPage() {
  const { movieId } = useParams<{ movieId: string }>()
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!movieId) return

    setLoading(true)
    setError(null)
    fetchMovie(movieId)
      .then(setMovie)
      .catch(() => setError('Não foi possível carregar os detalhes deste filme.'))
      .finally(() => setLoading(false))
  }, [movieId])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b16] px-4 py-8 text-white sm:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-5 w-40 rounded bg-white/10" />
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <div className="h-[420px] rounded-3xl bg-white/[0.06]" />
            <div className="space-y-5"><div className="h-12 w-2/3 rounded bg-white/10" /><div className="h-24 rounded bg-white/[0.06]" /></div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !movie) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#070b16] px-6 text-center text-white">
        <div>
          <p className="text-lg text-red-300">{error ?? 'Filme não encontrado.'}</p>
          <Link to="/" className="mt-5 inline-flex rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-300">Voltar ao catálogo</Link>
        </div>
      </main>
    )
  }

  const backdrop = movie.url_backdrop || movie.url_poster || '/placeholder-poster.svg'
  const performance = movie.desempenho

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b16] text-white">
      <section className="relative isolate min-h-[540px] overflow-hidden">
        <img src={backdrop} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-35 blur-[1px]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#070b16] via-[#070b16]/95 to-[#070b16]/55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#070b16] via-transparent to-[#070b16]/40" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-amber-400">← Voltar ao catálogo</Link>
          <div className="mt-12 grid items-end gap-10 lg:grid-cols-[250px_1fr]">
            <img src={movie.url_poster || '/placeholder-poster.svg'} alt={`Pôster de ${movie.titulo}`} className="w-full rounded-3xl border border-white/15 object-cover shadow-2xl shadow-black/50" />
            <div className="pb-2">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Detalhes do filme</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">{movie.titulo}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span>{movie.ano_lancamento ?? 'Ano desconhecido'}</span><span className="text-slate-600">•</span><span>{movie.duracao_minutos ? `${movie.duracao_minutos} min` : 'Duração não informada'}</span><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-300">{movie.status_filme || 'Status não informado'}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">{movie.generos.map((genero) => <span key={genero} className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950">{genero}</span>)}</div>
              <div className="mt-7 flex items-center gap-3"><span className="text-2xl text-amber-400">★</span><span className="text-2xl font-bold">{movie.nota_media?.toFixed(1) ?? '—'}</span><span className="text-sm text-slate-400">média das avaliações</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-8 lg:grid-cols-[1.4fr_0.6fr] lg:px-12">
        <section className="space-y-8">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"><h2 className="text-xl font-bold">Sobre o filme</h2><p className="mt-4 leading-8 text-slate-300">{movie.sinopse || 'Sinopse não disponível.'}</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"><h2 className="text-xl font-bold">Equipe</h2><div className="mt-6 grid gap-6 sm:grid-cols-2"><PeopleGroup title="Direção" people={movie.diretores} /><PeopleGroup title="Roteiro" people={movie.roteiristas} /><PeopleGroup title="Elenco" people={movie.atores} /><PeopleGroup title="Produtoras" people={movie.produtoras} /></div></div>
          <section><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">Avaliações</h2><span className="text-sm text-slate-500">{movie.avaliacoes.length} registrada(s)</span></div><div className="space-y-3">{movie.avaliacoes.length ? movie.avaliacoes.map((review) => <article key={review.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><div className="flex items-center justify-between gap-4"><strong>{review.nome}</strong><span className="font-bold text-amber-400">★ {review.nota.toFixed(1)}</span></div><p className="mt-3 text-sm leading-6 text-slate-300">{review.comentario}</p><time className="mt-3 block text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString('pt-BR')}</time></article>) : <p className="rounded-2xl border border-dashed border-white/15 p-6 text-slate-400">Ainda não há avaliações para este filme.</p>}</div></section>
        </section>

        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-6"><h2 className="text-xl font-bold">Desempenho</h2>{performance ? <div className="mt-6 space-y-4 text-sm"><div className="flex justify-between gap-4"><span className="text-slate-400">Popularidade</span><strong>{performance.popularidade?.toFixed(1) ?? '—'}</strong></div><div className="flex justify-between gap-4"><span className="text-slate-400">Nota TMDB</span><strong>{performance.nota_tmdb?.toFixed(1) ?? '—'}</strong></div><div className="flex justify-between gap-4"><span className="text-slate-400">Nota IMDb</span><strong>{performance.nota_imdb?.toFixed(1) ?? '—'}</strong></div><div className="my-4 border-t border-white/10" /><div className="flex justify-between gap-4"><span className="text-slate-400">Lucro (USD)</span><strong className="text-emerald-300">{performance.lucro_usd}</strong></div><div className="flex justify-between gap-4"><span className="text-slate-400">Lucro (BRL)</span><strong className="text-emerald-300">{performance.lucro_brl}</strong></div></div> : <p className="mt-4 text-sm leading-6 text-slate-400">Não há dados de desempenho disponíveis para este filme.</p>}</aside>
      </div>
    </main>
  )
}
