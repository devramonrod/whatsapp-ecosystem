import { login, signup } from './actions'
import { BotMessageSquare } from 'lucide-react'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        <div className="flex flex-col items-center justify-center text-center">
          {searchParams?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4 w-full">
              {searchParams.error === 'true' ? 'Credenciais inválidas. Tente novamente.' : searchParams.error}
            </div>
          )}
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-md mb-4">
            <BotMessageSquare className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ecosystem AI</h2>
          <p className="text-sm text-slate-500 mt-2">Faça login para gerenciar sua frota de agentes no WhatsApp</p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Endereço de E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@exemplo.com"
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Senha de Acesso
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-2">
            <button
              formAction={login}
              className="flex w-full justify-center cursor-pointer rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Entrar no Painel
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Segurança blindada por arquitetura Server-Side (HttpOnly) & Supabase Auth.
        </p>
      </div>
    </div>
  )
}
