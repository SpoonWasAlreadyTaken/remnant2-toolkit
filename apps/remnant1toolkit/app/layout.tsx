import './globals.css'

import { GlobalActionButtons } from '@repo/ui/global-action-buttons'
import { RootLayout } from '@repo/ui/pages/root-layout'
import { Viewport } from 'next'
import dynamic from 'next/dynamic'

import { getSession } from '@/app/(features)/auth/services/sessionService'

export const viewport: Viewport = {}
export { metadata } from './metadata'

const AlertBanner = dynamic(() => import('@repo/ui/alert-banner'), {
  ssr: false,
})

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <RootLayout
      alertBanner={
        null
        // <AlertBanner localStorageKey="builds-by-collection">
        //   You can now filter builds by items you own! Use the "include" filter
        //   and select "Only Owned Items".
        // </AlertBanner>
      }
      footer={null}
      navbar={null}
      trackers={null}
    >
      <GlobalActionButtons username={session?.user?.name || 'Unknown User'} />
      {children}
    </RootLayout>
  )
}
