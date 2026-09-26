import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { login } from '../data/api'

type LoginPageProps = {
  onLogin: (token: string) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (sending) return

    setSending(true)
    setError(null)

    try {
      const result = await login({
        username: username.trim(),
        password,
      })

      onLogin(result.access_token)
      navigate('/', { replace: true })
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível entrar. Tente novamente.',
      )
    } finally {
      setSending(false)
    }
  }

  const inputClasses =
    'mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10'

  return (
    <main className="flex min-h-screen flex-col bg-[#0b0d12] px-5 py-8 text-white">
      <Link
        to="/"
        className="w-fit rounded-lg text-sm text-slate-400 transition hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-amber-400"
      >
        ← Voltar ao catálogo
      </Link>

      <div className="flex flex-1 items-center justify-center py-12">
        <section
          aria-labelledby="login-title"
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 sm:p-9"
        >
          <span
            aria-hidden="true"
            className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-xl font-black text-slate-950"
          >
            R
          </span>

          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-amber-400">
            RocketLab Cinema
          </p>

          <h1 id="login-title" className="mt-2 text-3xl font-bold">
            Acesso administrativo
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Entre para cadastrar, editar e remover filmes do catálogo.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <fieldset disabled={sending} className="space-y-5">
              <legend className="sr-only">
                Credenciais do administrador
              </legend>

              <label className="block text-sm font-medium text-slate-300">
                Usuário
                <input
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  maxLength={120}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Seu usuário"
                  className={inputClasses}
                />
              </label>

              <label className="block text-sm font-medium text-slate-300">
                Senha
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={1024}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Sua senha"
                  className={inputClasses}
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 disabled:cursor-wait disabled:opacity-60"
              >
                {sending ? 'Entrando...' : 'Entrar'}
              </button>
            </fieldset>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  )
}