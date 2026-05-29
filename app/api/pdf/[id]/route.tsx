import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getConfig } from '@/actions/config'
import { getItemizedPrices } from '@/actions/price'
import { renderToBuffer } from '@react-pdf/renderer'
import { ConfigPDF } from '@/components/ConfigPDF'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await getConfig(id)
  if (!config) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const items = config.configuration_items.map(i => ({
    part_id: i.part_id,
    quantity: i.quantity,
  }))
  const lineItems = await getItemizedPrices(items)
  const total = lineItems.reduce((s, i) => s + i.subtotal, 0)

  const buffer = await renderToBuffer(
    <ConfigPDF configName={config.name} lineItems={lineItems} total={total} />
  )

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(config.name)}.pdf"`,
    },
  })
}
