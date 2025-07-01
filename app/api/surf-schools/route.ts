import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    
    const { data: schools, error } = await supabase
      .from('surf_schools')
      .select('id, name, slug')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching surf schools:', error)
      return NextResponse.json(
        { error: 'Failed to fetch surf schools', schools: [] },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ schools: schools || [] })
  } catch (error) {
    console.error('Unexpected error in surf-schools API:', error)
    return NextResponse.json(
      { error: 'Internal server error', schools: [] },
      { status: 500 }
    )
  }
}