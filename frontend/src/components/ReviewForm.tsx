import { useState } from 'react'
import type { FormEvent } from 'react'
import { createReview } from '../data/api'

type ReviewFormProps = {
  movieId: string
  onCreated: () => void
}

export default function ReviewForm({
  movieId,
  onCreated,
}: ReviewFormProps) {
  const [nome, setNome] = useState('')
  const [nota, setNota] = useState('')
  const [comentario, setComentario] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const inputClasses =
    'w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (sending) return

    setError(null)
    setSuccess(false)

    const numericRating = Number(nota)

    if (!nome.trim() || !comentario.trim()) {
      setError('Preencha seu nome e comentário.')
      return
    }

    if (
      !nota.trim() ||
      !Number.isFinite(numericRating) ||
      numericRating < 0 ||
      numericRating > 10
    ) {
      setError('Informe uma nota entre 0 e 10.')
      return
    }

    setSending(true)

    try {
      await createReview(movieId, {
        nome: nome.trim(),
        nota: numericRating,
        comentario: comentario.trim(),
      })
    } catch {
      setError('Não foi possível enviar sua avaliação. Tente novamente.')
      return
    } finally {
      setSending(false)
    }

    setNome('')
    setNota('')
    setComentario('')
    setSuccess(true)
    onCreated()
  }

  return (
    <section
      aria-labelledby="review-form-title"
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
        Sua opinião importa
      </p>

      <h2
        id="review-form-title"
        className="mt-2 text-xl font-bold text-white"
      >
        O que você achou do filme?
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Dê uma nota de 0 a 10 e compartilhe sua experiência.
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <fieldset disabled={sending} className="space-y-5">
          <legend className="sr-only">Nova avaliação</legend>

          <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Seu nome
              </span>

              <input
                type="text"
                autoComplete="name"
                required
                maxLength={120}
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Como podemos te chamar?"
                className={inputClasses}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Nota / 10
              </span>

              <input
                type="number"
                inputMode="decimal"
                required
                min={0}
                max={10}
                step={0.1}
                value={nota}
                onChange={(event) => setNota(event.target.value)}
                placeholder="Ex.: 8,5"
                className={inputClasses}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Seu comentário
            </span>

            <textarea
              required
              maxLength={4000}
              rows={4}
              value={comentario}
              onChange={(event) => setComentario(event.target.value)}
              placeholder="Conte o que mais chamou sua atenção..."
              className={`${inputClasses} resize-y`}
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            {sending ? 'Enviando...' : 'Publicar avaliação'}
          </button>
        </fieldset>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-300">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="mt-4 text-sm text-emerald-300">
            Avaliação publicada com sucesso!
          </p>
        )}
      </form>
    </section>
  )
}