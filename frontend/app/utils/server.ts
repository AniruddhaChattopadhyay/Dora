// utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  // ⬇️ resolve the promise first
  const cookieStore = await cookies()
  
  // Debug: Log available cookies
  const allCookies = cookieStore.getAll()
  console.log('Available cookies:', allCookies)

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      /** NEW cookie contract expected by @supabase/ssr ≥ 0.4 */
      cookies: {
        getAll() {
          const cookies = cookieStore.getAll()
          console.log('Getting all cookies:', cookies)
          return cookies
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              console.log('Setting cookie:', { name, value, options })
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            console.error('Error setting cookies:', error)
            /* ignore – we're in an RSC where .set() isn't allowed */
          }
        },
      },
    },
  )
}
