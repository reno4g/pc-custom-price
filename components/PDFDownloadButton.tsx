'use client'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

type Props = {
  configId: string
  configName: string
}

export default function PDFDownloadButton({ configId, configName }: Props) {
  return (
    <a
      href={`/api/pdf/${configId}`}
      download={`${configName}.pdf`}
      className={cn(buttonVariants({ variant: 'outline' }))}
    >
      PDFで出力
    </a>
  )
}
