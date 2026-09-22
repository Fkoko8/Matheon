import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface AuthState { user: User | null; configured: boolean }
export function isAuthConfigured() { return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) }
export async function getAuthState(): Promise<AuthState> { const supabase = createClient(); if (!supabase) return { user: null, configured: false }; const { data } = await supabase.auth.getUser(); return { user: data.user, configured: true } }
export async function signInWithPassword(email: string, password: string) { const supabase = createClient(); if (!supabase) return { error: new Error('Supabase Auth is not configured') }; return supabase.auth.signInWithPassword({ email, password }) }
export async function signUpWithPassword(email: string, password: string) { const supabase = createClient(); if (!supabase) return { error: new Error('Supabase Auth is not configured') }; return supabase.auth.signUp({ email, password, options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback` } }) }
export async function signInWithGoogle() { const supabase = createClient(); if (!supabase) return { error: new Error('Supabase Auth is not configured') }; return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback` } }) }
export async function signOut() { const supabase = createClient(); if (supabase) await supabase.auth.signOut() }
