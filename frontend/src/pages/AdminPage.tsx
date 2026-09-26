import { useState } from 'react'
import { Link } from 'react-router-dom'

import MovieCreateForm from '../components/MovieCreateForm'
import MovieManageList from '../components/MovieManageList'

type AdminPageProps = {
  token: string
  onLogout: () => void
}

export default function AdminPage({
  token,
  onLogout,
}: AdminPageProps) {
  const [view, setView] = useState<'manage' | 'create'>('manage')

  function tabClasses(active: boolean) {
    return [
      'rounded-xl px-5 py-3 text-sm font-semibold transition',
      active
        ? 'bg-amber-400 text-slate-950'
        : 'text-slate-400 hover:bg-white/5 hover:text-white',
    ].join(' ')
  }

  return (
    <main className="min-h-screen bg-[#0b0d12] px-5 py-8 text-white sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link
            to="/"
            className="text-sm text-slate-400 hover:text-amber-300"
          >
            ← Voltar ao catálogo
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/5"
          >
            Sair da administração
          </button>
        </header>

        <section className="py-12">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
            RocketLab Cinema
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            Painel administrativo
          </h1>

          <p className="mt-4 max-w-xl leading-7 text-slate-400">
            Cadastre filmes e mantenha as informações do catálogo atualizadas.
          </p>

          <div
            aria-label="Seções da administração"
            className="mt-8 flex flex-wrap gap-2"
          >
            <button
              type="button"
              aria-pressed={view === 'manage'}
              onClick={() => setView('manage')}
              className={tabClasses(view === 'manage')}
            >
              Gerenciar filmes
            </button>

            <button
              type="button"
              aria-pressed={view === 'create'}
              onClick={() => setView('create')}
              className={tabClasses(view === 'create')}
            >
              Cadastrar filme
            </button>
          </div>

          <div className="mt-6">
            {view === 'manage' ? (
              <MovieManageList token={token} />
            ) : (
              <MovieCreateForm token={token} />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}