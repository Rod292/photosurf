import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE() {
  try {
    // Delete surf schools ESB and Rise Up
    const { data, error } = await supabase
      .from('surf_schools')
      .delete()
      .or('name.ilike.%ESB%,name.ilike.%Rise Up%')
    
    if (error) {
      console.error('Error deleting surf schools:', error)
      return NextResponse.json({ error: 'Failed to delete surf schools' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Successfully deleted ESB and Rise Up surf schools',
      deletedCount: data?.length || 0
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}