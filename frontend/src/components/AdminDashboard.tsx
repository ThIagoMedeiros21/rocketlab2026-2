import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { fetchDashboard } from '../data/api'
import type { DashboardResponse } from '../types/dashboard'

type AdminDashboardProps = {
  token: string
}

type RankingKey =
  | 'melhores_filmes'
  | 'melhores_tmdb'
  | 'melhores_imdb'
  | 'maiores_lucros'
  | 'maiores_bilheterias'
  | 'maiores_retornos'
  | 'mais_populares'

type RankingRow = {
  id: string
  titulo: string
  ano: number | null
  valor: string
  detalhe: string
}

const integer = new Intl.NumberFormat('pt-BR')

const decimal = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
})

const dollars = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const panel =
  'rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7'

const selectClasses =
  'w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400 sm:w-auto'

const rankingLabels: Record<RankingKey, string> = {
  melhores_filmes: 'Melhores notas dos usuários',
  melhores_tmdb: 'Melhores notas no TMDB',
  melhores_imdb: 'Melhores notas no IMDb',
  maiores_lucros: 'Maiores lucros estimados',
  maiores_bilheterias: 'Maiores bilheterias',
  maiores_retornos: 'Maiores retornos percentuais',
  mais_populares: 'Mais populares',
}

function money(value: number | null): string {
  return value === null ? 'Não informado' : dollars.format(value)
}

function buildRanking(
  data: DashboardResponse,
  ranking: RankingKey,
): RankingRow[] {
  if (ranking === 'melhores_filmes') {
    return data.melhores_filmes.map((movie) => ({
      id: movie.id,
      titulo: movie.titulo,
      ano: movie.ano_lancamento,
      valor: `${decimal.format(movie.nota_media)} / 10`,
      detalhe: `${integer.format(movie.quantidade_avaliacoes)} avaliações`,
    }))
  }

  if (ranking === 'melhores_tmdb' || ranking === 'melhores_imdb') {
    return data[ranking].map((movie) => ({
      id: movie.id,
      titulo: movie.titulo,
      ano: movie.ano_lancamento,
      valor: `${decimal.format(movie.nota)} / 10`,
      detalhe: `${integer.format(movie.quantidade_votos)} votos na fonte`,
    }))
  }

  if (ranking === 'mais_populares') {
    return data.mais_populares.map((movie) => ({
      id: movie.id,
      titulo: movie.titulo,
      ano: movie.ano_lancamento,
      valor: decimal.format(movie.popularidade),
      detalhe: 'Índice de popularidade da base',
    }))
  }

  return data[ranking].map((movie) => {
    let valor: string

    if (ranking === 'maiores_lucros') {
      valor = money(movie.lucro_estimado_usd)
    } else if (ranking === 'maiores_bilheterias') {
      valor = money(movie.receita_usd)
    } else {
      valor =
        movie.retorno_percentual === null
          ? 'Não informado'
          : `${decimal.format(movie.retorno_percentual)}%`
    }

    return {
      id: movie.id,
      titulo: movie.titulo,
      ano: movie.ano_lancamento,
      valor,
      detalhe:
        `Orçamento: ${money(movie.orcamento_usd)} · ` +
        `Receita: ${money(movie.receita_usd)}`,
    }
  })
}

type MetricCardProps = {
  label: string
  value: string
  description: string
}

function MetricCard({
  label,
  value,
  description,
}: MetricCardProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 h-20 w-20 rounded-full bg-amber-400/5 blur-2xl"
      />
      <p className="text-sm text-slate-400">{label}</p>
      <strong className="mt-3 block text-3xl font-black tracking-tight text-white">
        {value}
      </strong>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  )
}

type BarChartProps = {
  title: string
  description: string
  items: {
    label: string
    value: number
  }[]
}

function BarChart({
  title,
  description,
  items,
}: BarChartProps) {
  const maximum = Math.max(1, ...items.map((item) => item.value))

  return (
    <section className={panel}>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          Não há dados disponíveis.
        </p>
      ) : (
        <ul
          aria-label={title}
          className="mt-6 max-h-[420px] space-y-5 overflow-y-auto pr-2"
        >
          {items.map((item) => (
            <li key={item.label}>
              <div className="mb-2 flex items-start justify-between gap-4 text-sm">
                <span className="break-words text-slate-300">
                  {item.label}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-white">
                  {integer.format(item.value)}
                </span>
              </div>

              <div
                aria-hidden="true"
                className="h-2 overflow-hidden rounded-full bg-white/5"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                  style={{
                    width: `${(item.value / maximum) * 100}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function AdminDashboard({
  token,
}: AdminDashboardProps) {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [minimum, setMinimum] = useState(3)
  const [ranking, setRanking] = useState<RankingKey>('melhores_filmes')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadDashboard() {
      setLoading(true)
      setError(null)

      try {
        const result = await fetchDashboard(
          token,
          minimum,
          controller.signal,
        )

        if (!controller.signal.aborted) {
          setData(result)
        }
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : 'Não foi possível carregar o dashboard.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => controller.abort()
  }, [token, minimum, reload])

  const rows = data ? buildRanking(data, ranking) : []
  const indicators = data?.indicadores

  const financial =
    ranking === 'maiores_lucros' ||
    ranking === 'maiores_bilheterias' ||
    ranking === 'maiores_retornos'

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-amber-400/15 bg-gradient-to-br from-amber-400/10 via-white/[0.02] to-transparent p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Visão do catálogo
            </p>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Os números por trás das histórias
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Explore as avaliações, a distribuição dos títulos e o
              desempenho financeiro registrado na base.
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => setReload((value) => value + 1)}
            className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-40"
          >
            {loading ? 'Carregando...' : 'Atualizar dados'}
          </button>
        </div>
      </section>

      {loading ? (
        <div
          role="status"
          className={`${panel} py-16 text-center text-slate-400`}
        >
          Consultando indicadores e rankings...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-300"
        >
          <p>{error}</p>
          <p className="mt-2">
            Use “Atualizar dados” para tentar novamente. Se a sessão
            expirou, saia da administração e entre novamente.
          </p>
        </div>
      ) : data && indicators ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Filmes cadastrados"
              value={integer.format(indicators.total_filmes)}
              description="Total de registros do catálogo"
            />
            <MetricCard
              label="Avaliações dos usuários"
              value={integer.format(indicators.total_avaliacoes)}
              description="Avaliações individuais registradas"
            />
            <MetricCard
              label="Média geral"
              value={
                indicators.media_geral === null
                  ? '—'
                  : `${decimal.format(indicators.media_geral)} / 10`
              }
              description="Média de todas as notas dos usuários"
            />
            <MetricCard
              label="Filmes avaliados"
              value={integer.format(indicators.filmes_avaliados)}
              description="Títulos com pelo menos uma avaliação"
            />
          </div>

          <section className={panel}>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Rankings do catálogo
                </p>
                <h3 className="mt-2 text-xl font-bold">
                  {rankingLabels[ranking]}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Até dez registros, ordenados pelo indicador selecionado.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block">
                  <span className="mb-2 block text-xs text-slate-400">
                    Indicador
                  </span>
                  <select
                    value={ranking}
                    onChange={(event) =>
                      setRanking(event.target.value as RankingKey)
                    }
                    className={selectClasses}
                  >
                    {Object.entries(rankingLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                {ranking === 'melhores_filmes' && (
                  <label className="block">
                    <span className="mb-2 block text-xs text-slate-400">
                      Mínimo de avaliações
                    </span>
                    <select
                      value={minimum}
                      onChange={(event) =>
                        setMinimum(Number(event.target.value))
                      }
                      className={selectClasses}
                    >
                      {[1, 3, 5, 10].map((value) => (
                        <option key={value} value={value}>
                          {value} avaliações
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            </div>

            {(ranking === 'melhores_tmdb' ||
              ranking === 'melhores_imdb') && (
              <p className="mt-4 text-xs leading-5 text-slate-400">
                Apenas registros com pelo menos{' '}
                {data.minimo_votos_externos} votos na respectiva fonte.
              </p>
            )}

            {financial && (
              <p className="mt-4 rounded-xl border border-amber-400/10 bg-amber-400/5 p-4 text-xs leading-6 text-amber-100/70">
                Valores em dólares da base importada. Lucro estimado:
                receita menos orçamento, sem considerar todos os custos.
                Retorno: (receita − orçamento) ÷ orçamento × 100.
                Valores atípicos podem refletir inconsistências na origem.
              </p>
            )}

            {rows.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400">
                Nenhum registro atende aos critérios deste ranking.
              </p>
            ) : (
              <ol className="mt-6 space-y-3">
                {rows.map((movie, index) => (
                  <li key={movie.id}>
                    <Link
                      to={`/movies/${movie.id}`}
                      className="group flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/10 p-4 transition hover:border-amber-400/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-amber-400 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <span
                          className={
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ' +
                            (index < 3
                              ? 'bg-amber-400/15 text-amber-300'
                              : 'bg-white/5 text-slate-500')
                          }
                        >
                          {index + 1}
                        </span>

                        <div className="min-w-0">
                          <h4 className="break-words font-semibold text-white group-hover:text-amber-300">
                            {movie.titulo}
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            {movie.ano ?? 'Ano não informado'}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-slate-400">
                            {movie.detalhe}
                          </p>
                        </div>
                      </div>

                      <strong className="shrink-0 pl-14 text-lg tabular-nums text-amber-300 sm:pl-0 sm:text-right">
                        {movie.valor}
                      </strong>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <BarChart
              title="Filmes por gênero"
              description="Um filme pode aparecer em mais de um gênero."
              items={data.filmes_por_genero.map((item) => ({
                label: item.genero,
                value: item.quantidade,
              }))}
            />

            <BarChart
              title="Lançamentos por ano"
              description="Distribuição dos registros por ano de lançamento."
              items={data.filmes_por_ano.map((item) => ({
                label: String(item.ano),
                value: item.quantidade,
              }))}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 p-5 text-sm text-slate-400 sm:flex-row sm:justify-between">
            <p>
              Sem gênero:{' '}
              <strong className="text-white">
                {integer.format(indicators.filmes_sem_genero)}
              </strong>
            </p>
            <p>
              Sem ano:{' '}
              <strong className="text-white">
                {integer.format(indicators.filmes_sem_ano)}
              </strong>
            </p>
          </div>

          <p className="text-xs leading-6 text-slate-500">
            Os rankings representam os registros da base importada.
            Notas externas, popularidade e valores financeiros não são
            atualizados automaticamente nas fontes.
          </p>
        </>
      ) : null}
    </div>
  )
}