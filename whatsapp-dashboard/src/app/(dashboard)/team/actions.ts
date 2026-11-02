'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

function getAdminClient() {
  return createSupabaseClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function createUserAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase
    .from('userprofile')
    .select('*')
    .eq('userid', user.id)
    .single()

  if (!profile || profile.role === 'MEMBRO') {
    return { error: 'Você não tem permissão para criar usuários.' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  let companyName = formData.get('companyName') as string
  let targetRole = formData.get('role') as string || 'MEMBRO'

  if (profile.role === 'SUPER_ADMIN') {
    if (!formData.get('role')) targetRole = 'SOCIO';
  } else if (profile.role === 'SOCIO') {
    if (targetRole !== 'MEMBRO' && targetRole !== 'SOCIO') {
      targetRole = 'MEMBRO';
    }
    companyName = profile.companyname;
  }

  const adminClient = getAdminClient()

  const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (newUser.user) {
    const { error: dbError } = await adminClient
      .from('userprofile')
      .insert({
        userid: newUser.user.id,
        name: name,
        companyname: companyName,
        role: targetRole
      })

    if (dbError) {
      return { error: 'Erro ao criar perfil no banco: ' + dbError.message }
    }
  }

  revalidatePath('/team')
  return { success: true }
}
