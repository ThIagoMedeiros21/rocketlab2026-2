import { Link } from 'react-router-dom'
import MovieCreateForm from '../components/MovieCreateForm'

type AdminPageProps = {
  token: string
  onLogout: () => void
}

export default function AdminPage({
  token,
  onLogout,
}: AdminPageProps) {
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
            Você está autenticado como administrador.
            Cadastre novos filmes para o catálogo.
          </p>

          <div className="mt-8">
            <MovieCreateForm token={token} />
          </div>
        </section>
      </div>
    </main>
  )
}