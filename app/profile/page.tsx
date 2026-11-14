import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Profile(){
  const supabase=await createClient()
  const {data:{claims}}=await supabase.auth.getClaims()
  if(!claims?.sub) redirect('/sign-in')
  const {data:profile}=await supabase.from('profiles').select('full_name,year_of_study,language,verified_cusat').eq('id',claims.sub).maybeSingle()
  return <main className="auth"><div className="authcard wide"><a href="/" className="back">← Home</a><div className="mark big">SFI</div><h1>Your student profile</h1><p>Keep your basic student information here. Sensitive service data stays in its own protected workflow.</p><div className="profilegrid"><div><span>Name</span><strong>{profile?.full_name||'Add your name'}</strong></div><div><span>Year</span><strong>{profile?.year_of_study||'Not added'}</strong></div><div><span>Language</span><strong>{profile?.language==='ml'?'മലയാളം':'English'}</strong></div><div><span>CUSAT verification</span><strong>{profile?.verified_cusat?'Verified':'Not verified'}</strong></div></div><p className="fine">Profile editing and verified @cusat.ac.in status will be expanded in Phase 1.</p></div></main>
}