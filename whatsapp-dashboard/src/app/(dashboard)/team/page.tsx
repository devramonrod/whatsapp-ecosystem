import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TeamManager from './TeamManager'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('userprofile')
    .select('*')
    .eq('userid', user.id)
    .single()

  if (!profile || profile.role === 'MEMBRO') {
    redirect('/')
  }

  let query = supabase.from('userprofile').select('*')
  if (profile.role === 'SOCIO') {
    query = query.eq('companyname', profile.companyname)
  }
  
  const { data: usersList } = await query.order('role', { ascending: false })

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          {profile.role === 'SUPER_ADMIN' ? 'Gerenciar Tenants' : 'Gerenciar Equipe'}
        </h1>
        <p className="text-slate-500 mt-2">
          {profile.role === 'SUPER_ADMIN' 
            ? 'Crie e gerencie os donos de negocios que utilizam a plataforma.' 
            : 'Adicione membros para acessar os agentes da sua empresa.'}
        </p>
      </div>

      <TeamManager currentProfile={profile} usersList={usersList || []} />
    </div>
  )
}