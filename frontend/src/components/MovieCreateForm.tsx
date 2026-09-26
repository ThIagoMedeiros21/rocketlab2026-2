import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { createMovie } from '../data/api'
import type { MovieCreated } from '../types/movie'

type MovieCreateFormProps = {
  token: string
}

export default function MovieCreateForm({
  token,
}: MovieCreateFormProps) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<MovieCreated | null>(null)

  const inputClasses =
    'mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (sending) return

    const form = event.currentTarget
    const fields = new FormData(form)

    function text(name: string) {
      return String(fields.get(name) ?? '').trim()
    }

    function optionalNumber(name: string) {
      const value = text(name)
      return value ? Number(value) : null
    }

    function names(name: string) {
      return text(name)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    }

    const titulo = text('titulo')
    const generos = names('generos')
    const diretores = names('diretores')

    setError(null)
    setCreated(null)

    if (!titulo) {
      setError('Informe o título do filme.')
      return
    }

    for (const list of [generos, diretores]) {
      const normalized = list.map((name) => name.toLowerCase())

      if (new Set(normalized).size !== normalized.length) {
        setError('Não repita nomes nos gêneros ou nos diretores.')
        return
      }
    }

    if (
      generos.some((name) => name.length > 50) ||
      diretores.some((name) => name.length > 255)
    ) {
      setError(
        'Cada gênero pode ter até 50 caracteres e cada diretor, até 255.',
      )
      return
    }

    setSending(true)

    try {
      const result = await createMovie(
        {
          titulo,
          ano_lancamento: optionalNumber('ano_lancamento'),
          data_lancamento: text('data_lancamento') || null,
          duracao_minutos: optionalNumber('duracao_minutos'),
          status_filme: text('status_filme') || null,
          sinopse: text('sinopse') || null,
          url_poster: text('url_poster') || null,
          url_backdrop: text('url_backdrop') || null,
          generos,
          diretores,
        },
        token,
      )

      setCreated(result)
      form.reset()
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível cadastrar o filme.',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <h2 className="text-2xl font-bold">Cadastrar filme</h2>

      <p className="mt-2 text-sm text-slate-400">
        Adicione um novo título ao catálogo. Apenas o título é obrigatório.
      </p>

      <form onSubmit={handleSubmit} className="mt-8">
        <fieldset disabled={sending} className="space-y-6">
          <legend className="sr-only">Informações do filme</legend>

          <label className="block text-sm font-medium text-slate-300">
            Título *
            <input
              name="titulo"
              required
              maxLength={500}
              placeholder="Nome do filme"
              className={inputClasses}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-300">
              Ano de lançamento
              <input
                name="ano_lancamento"
                type="number"
                min={1}
                max={9999}
                step={1}
                placeholder="Ex.: 2025"
                className={inputClasses}
              />
            </label>

            <label className="block text-sm font-medium text-slate-300">
              Data de lançamento
              <input
                name="data_lancamento"
                type="date"
                className={`${inputClasses} [color-scheme:dark]`}
              />
            </label>

            <label className="block text-sm font-medium text-slate-300">
              Duração em minutos
              <input
                name="duracao_minutos"
                type="number"
                min={1}
                step={1}
                placeholder="Ex.: 120"
                className={inputClasses}
              />
            </label>

            <label className="block text-sm font-medium text-slate-300">
              Status
              <input
                name="status_filme"
                maxLength={50}
                placeholder="Ex.: Lançado"
                className={inputClasses}
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-300">
              Gêneros
              <input
                name="generos"
                placeholder="Drama, Romance"
                aria-describedby="generos-help"
                className={inputClasses}
              />
              <span
                id="generos-help"
                className="mt-2 block text-xs font-normal text-slate-400"
              >
                Separe os gêneros por vírgulas.
              </span>
            </label>

            <label className="block text-sm font-medium text-slate-300">
              Diretores
              <input
                name="diretores"
                placeholder="Ana Silva, Carlos Mendes"
                aria-describedby="diretores-help"
                className={inputClasses}
              />
              <span
                id="diretores-help"
                className="mt-2 block text-xs font-normal text-slate-400"
              >
                Separe os nomes por vírgulas.
              </span>
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-300">
            Sinopse
            <textarea
              name="sinopse"
              rows={5}
              maxLength={4000}
              placeholder="Sobre o que é o filme?"
              className={`${inputClasses} resize-y`}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-300">
              URL do pôster
              <input
                name="url_poster"
                type="url"
                maxLength={2048}
                placeholder="https://..."
                className={inputClasses}
              />
            </label>

            <label className="block text-sm font-medium text-slate-300">
              URL da imagem de fundo
              <input
                name="url_backdrop"
                type="url"
                maxLength={2048}
                placeholder="https://..."
                className={inputClasses}
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            {sending ? 'Cadastrando...' : 'Cadastrar filme'}
          </button>
        </fieldset>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        {created && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200"
          >
            <p>
              <strong>{created.titulo}</strong> foi cadastrado!
            </p>

            <Link
              to={`/movies/${created.id}`}
              className="mt-2 inline-block font-semibold underline"
            >
              Ver filme no catálogo →
            </Link>
          </div>
        )}
      </form>
    </section>
  )
}