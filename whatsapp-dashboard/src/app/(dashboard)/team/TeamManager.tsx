'use client'

import { useState } from 'react'
import { createUserAction } from './actions'
import { PlusCircle, Shield, User, Building } from 'lucide-react'

export default function TeamManager({ currentProfile, usersList }: { currentProfile: any, usersList: any[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const res = await createUserAction(formData)

    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
    }
    setLoading(false)
  }

  const isSuperAdmin = currentProfile.role === 'SUPER_ADMIN'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1 h-fit">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          {isSuperAdmin ? 'Novo Tenant / Socio' : 'Novo Membro / Socio'}
        </h2>

        {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
        {success && <div className="p-3 mb-4 text-sm text-green-600 bg-green-50 rounded-lg">Usuario criado com sucesso!</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <input type="text" name="name" required className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ex: Joao Silva" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail de Acesso</label>
            <input type="email" name="email" required className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="joao@empresa.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha Provisoria</label>
            <input type="password" name="password" required className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="••••••••" />
          </div>

          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa (Tenant)</label>
              <input type="text" name="companyName" required className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Tech Solucoes" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Funcao (Role)</label>
            <select name="role" className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
              {isSuperAdmin ? (
                <>
                  <option value="SOCIO">Socio (Dono do Tenant)</option>
                  <option value="SUPER_ADMIN">Super Admin (Administrador Global)</option>
                </>
              ) : (
                <>
                  <option value="MEMBRO">Membro (Acesso Limitado)</option>
                  <option value="SOCIO">Socio (Administrador do Tenant)</option>
                </>
              )}
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Criando...' : isSuperAdmin ? 'Criar Usuario' : 'Adicionar a Equipe'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Usuarios Cadastrados</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-sm">
                <th className="pb-3 font-medium">Nome</th>
                <th className="pb-3 font-medium">Empresa</th>
                <th className="pb-3 font-medium">Funcao (Role)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
              {usersList.map((u) => (
                <tr key={u.userid} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-medium text-slate-900">{u.name || 'Sem Nome'}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      <Building className="w-3.5 h-3.5" />
                      {u.companyname}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'SOCIO' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {u.role === 'SUPER_ADMIN' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
              {usersList.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">Nenhum usuario encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}