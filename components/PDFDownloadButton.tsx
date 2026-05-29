'use client'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import type { PriceLineItem } from '@/actions/price'
import type { ConfigurationWithItems } from '@/types/database'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
)
const ConfigPDF = dynamic(
  () => import('./ConfigPDF').then(mod => mod.ConfigPDF),
  { ssr: false }
)

type Props = {
  config: ConfigurationWithItems
  lineItems: PriceLineItem[]
  total: number
}

export default function PDFDownloadButton({ config, lineItems, total }: Props) {
  return (
    <PDFDownloadLink
      document={<ConfigPDF configName={config.name} lineItems={lineItems} total={total} />}
      fileName={`${config.name}.pdf`}
    >
      {({ loading }: { loading: boolean }) => (
        <Button variant="outline" disabled={loading}>
          {loading ? '生成中...' : 'PDFで出力'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
