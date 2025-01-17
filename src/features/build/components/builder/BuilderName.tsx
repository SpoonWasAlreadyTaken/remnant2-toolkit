import { PencilIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

import { Input } from '@/features/ui/Input'
import { cn } from '@/lib/classnames'

export function BuilderName({
  isEditable,
  isEditingBuildName,
  isScreenshotMode,
  name,
  showControls,
  onClick,
  onClose,
}: {
  isEditable: boolean
  isEditingBuildName: boolean
  isScreenshotMode: boolean
  name: string
  showControls: boolean
  onClick: () => void
  onClose: (newBuildName: string) => void
}) {
  const [newName, setNewName] = useState(name)

  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-2">
      {isEditingBuildName && isEditable ? (
        <>
          <Input
            onChange={(e) => setNewName(e.target.value)}
            value={newName}
            placeholder={'Build Name'}
            id="buildname"
          />

          <div>
            <button
              aria-label="Save Build Name"
              onClick={() => onClose(newName)}
              className="bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 mr-2 rounded-md px-4 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Save
            </button>
            <button
              aria-label="Cancel Editing Build Name"
              onClick={() => onClose(name)}
              className="rounded-md bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="mb-2 flex w-full items-center justify-center gap-2">
          <h2
            className={cn(
              'whitespace-normal text-center text-2xl font-bold text-white sm:text-4xl',
              isScreenshotMode && 'text-4xl',
            )}
          >
            {name}
          </h2>
          {showControls && isEditable && (
            <button
              onClick={onClick}
              className="text-primary-400"
              aria-label="Edit Build Name"
            >
              <div className="flex grow items-end justify-start">
                <PencilIcon
                  className="text-primary-500 hover:text-primary-300 h-4 w-4"
                  aria-hidden="true"
                />
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
