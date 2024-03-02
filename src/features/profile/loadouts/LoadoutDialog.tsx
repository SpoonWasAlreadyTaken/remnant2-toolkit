import { Dialog } from '@/features/ui/Dialog'

import { LoadoutBuilds } from './LoadoutBuilds'

interface Props {
  open: boolean
  onClose: () => void
}

export function LoadoutDialog({ open, onClose }: Props) {
  return (
    <Dialog
      title="Loadouts"
      maxWidthClass="max-w-4xl"
      open={open}
      onClose={onClose}
    >
      <LoadoutBuilds />
    </Dialog>
  )
}
