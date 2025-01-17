import { useEffect, useState } from 'react'

import { getArmorSuggestions } from '@/features/armor-calculator/getArmorSuggestions'
import {
  ArmorSuggestion,
  WeightClassWithDefault,
} from '@/features/armor-calculator/types'
import { BuildState } from '@/features/build/types'
import { ItemButton } from '@/features/items/components/ItemButton'
import { ItemInfoDialog } from '@/features/items/components/ItemInfoDialog'
import { WEIGHT_CLASSES } from '@/features/items/constants'
import { Item } from '@/features/items/types'
import { Pagination } from '@/features/pagination/Pagination'
import { usePagination } from '@/features/pagination/usePagination'
import { Dialog } from '@/features/ui/Dialog'
import { SelectMenu } from '@/features/ui/SelectMenu'
import { cn } from '@/lib/classnames'

const ITEMS_PER_PAGE = 10

interface Props {
  buildState: BuildState
  open: boolean
  onClose: () => void
  onApplySuggestions: (newBuildState: BuildState) => void
}

export function ArmorSuggestionsDialog({
  buildState,
  open,
  onClose,
  onApplySuggestions,
}: Props) {
  const [isCalculating, setIsCalculating] = useState(false)

  // Tracks the item the user wants info on
  const [itemInfo, setItemInfo] = useState<Item | null>(null)
  // If the item info is defined, the modal should be open
  const isItemInfoOpen = Boolean(itemInfo)

  const [desiredWeightClass, setDesiredWeightClass] =
    useState<WeightClassWithDefault>('CHOOSE')

  const [armorSuggestions, setArmorSuggestions] = useState<ArmorSuggestion[]>(
    [],
  )

  const {
    currentPage,
    firstVisibleItemNumber,
    lastVisibleItemNumber,
    pageNumbers,
    totalPages,
    handleSpecificPageClick,
    handleNextPageClick,
    handlePreviousPageClick,
  } = usePagination({
    totalItemCount: armorSuggestions.length,
    itemsPerPage: ITEMS_PER_PAGE,
  })

  useEffect(() => {
    if (!isCalculating) return
    if (desiredWeightClass === 'CHOOSE') return

    // Start a timeout to delay the calculation
    // This allows the loading indicator to render
    const timeoutId = setTimeout(() => {
      setArmorSuggestions(
        getArmorSuggestions({ buildState, desiredWeightClass }),
      )
      handleSpecificPageClick(1)
      setIsCalculating(false)
    }, 250)

    // Clear the timeout when the component unmounts or when the dependencies change
    return () => clearTimeout(timeoutId)
  }, [buildState, desiredWeightClass, isCalculating, handleSpecificPageClick])

  const allSlotsFull = Boolean(
    buildState.items.helm &&
      buildState.items.torso &&
      buildState.items.gloves &&
      buildState.items.legs,
  )

  function handleWeightClassChange(weightClass: WeightClassWithDefault) {
    if (weightClass === 'CHOOSE') {
      setArmorSuggestions([])
      return
    }
    setDesiredWeightClass(weightClass)
    setIsCalculating(true)
  }

  function clearArmorSuggestions() {
    setDesiredWeightClass('CHOOSE')
    setArmorSuggestions([])
  }

  const armorInfoProps = {
    itemInfo: itemInfo,
    isDialogOpen: open,
    isItemInfoOpen: isItemInfoOpen,
    onDialogClose: onClose,
    onInfoClose: () => setItemInfo(null),
  }

  if (allSlotsFull) {
    return (
      <ArmorInfoContainer {...armorInfoProps}>
        <div className="text-md mt-4 text-center font-semibold text-red-500">
          All armor slots are full. Clear at least one slot for suggestions.
        </div>
      </ArmorInfoContainer>
    )
  }

  if (isCalculating) {
    return (
      <ArmorInfoContainer {...armorInfoProps}>
        <div className="flex flex-col items-center justify-center">
          <p className="text-md mt-4 animate-bounce text-center font-semibold">
            Calculating armor suggestions...this may take a moment.
          </p>
        </div>
      </ArmorInfoContainer>
    )
  }

  return (
    <ArmorInfoContainer {...armorInfoProps}>
      <div className="flex w-full flex-row items-end justify-center gap-x-2 text-left">
        <SelectMenu
          label="Desired Weight Class"
          name="desired_weight_class"
          options={[
            { label: 'Choose', value: 'CHOOSE' },
            { label: 'Light', value: 'LIGHT' },
            { label: 'Medium', value: 'MEDIUM' },
            { label: 'Heavy', value: 'HEAVY' },
            { label: 'Ultra', value: 'ULTRA' },
          ]}
          onChange={(e) =>
            handleWeightClassChange(e.target.value as WeightClassWithDefault)
          }
          value={desiredWeightClass}
        />
        <button
          className="mt-4 rounded-md border-2 border-red-500 p-2 text-sm text-white hover:bg-red-500 hover:text-white"
          aria-label="Clear armor suggestions"
          onClick={clearArmorSuggestions}
        >
          Clear
        </button>
      </div>
      {armorSuggestions.length === 0 && (
        <div className="flex flex-col items-center justify-center">
          <div className="text-md mt-4 text-center font-bold text-red-500">
            No armor suggestions found for the selected weight class.
          </div>
        </div>
      )}
      {armorSuggestions.length > 0 && (
        <div className="mt-4 flex w-full flex-col items-center justify-center">
          <div className="flex w-full flex-col items-center justify-center">
            <Pagination
              isLoading={isCalculating}
              currentPage={currentPage}
              firstVisibleItemNumber={firstVisibleItemNumber}
              lastVisibleItemNumber={lastVisibleItemNumber}
              pageNumbers={pageNumbers}
              totalItems={armorSuggestions.length}
              totalPages={totalPages}
              onPreviousPage={handlePreviousPageClick}
              onNextPage={handleNextPageClick}
              onSpecificPage={handleSpecificPageClick}
            />
            <div className="grid w-full grid-cols-1 gap-x-4 sm:grid-cols-2">
              {armorSuggestions
                .slice(
                  (currentPage - 1) * ITEMS_PER_PAGE,
                  currentPage * ITEMS_PER_PAGE,
                )
                .map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex w-full flex-col items-center justify-center border-t-2 border-t-primary-500 py-4"
                  >
                    <div className="mb-4 flex w-full flex-row items-center justify-center gap-x-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-md font-semibold">Armor</div>
                        <div className="text-2xl font-bold text-primary-500">
                          {suggestion.totalArmor}
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-md font-semibold">Weight</div>
                        <div
                          className={cn(
                            'text-2xl font-bold',
                            desiredWeightClass !== 'CHOOSE' &&
                              WEIGHT_CLASSES[desiredWeightClass].textColor,
                          )}
                        >
                          {suggestion.totalWeight}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-x-2">
                      <ItemButton
                        item={suggestion.helm}
                        isEditable={false}
                        size="md"
                        onItemInfoClick={() => setItemInfo(suggestion.helm)}
                        tooltipDisabled={isItemInfoOpen}
                      />
                      <ItemButton
                        item={suggestion.torso}
                        isEditable={false}
                        size="md"
                        onItemInfoClick={() => setItemInfo(suggestion.torso)}
                        tooltipDisabled={isItemInfoOpen}
                      />
                      <ItemButton
                        item={suggestion.legs}
                        isEditable={false}
                        size="md"
                        onItemInfoClick={() => setItemInfo(suggestion.legs)}
                        tooltipDisabled={isItemInfoOpen}
                      />
                      <ItemButton
                        item={suggestion.gloves}
                        isEditable={false}
                        size="md"
                        onItemInfoClick={() => setItemInfo(suggestion.gloves)}
                        tooltipDisabled={isItemInfoOpen}
                      />
                    </div>
                    <button
                      className="mt-4 rounded-md border-2 border-primary-500 bg-primary-800 p-2 text-sm text-white hover:bg-primary-500"
                      aria-label="Equip armor suggestions"
                      onClick={() =>
                        onApplySuggestions({
                          ...buildState,
                          items: {
                            ...buildState.items,
                            helm: suggestion.helm,
                            torso: suggestion.torso,
                            gloves: suggestion.gloves,
                            legs: suggestion.legs,
                          },
                        })
                      }
                    >
                      Equip Armor
                    </button>
                  </div>
                ))}
            </div>
            <Pagination
              isLoading={isCalculating}
              currentPage={currentPage}
              firstVisibleItemNumber={firstVisibleItemNumber}
              lastVisibleItemNumber={lastVisibleItemNumber}
              pageNumbers={pageNumbers}
              totalItems={armorSuggestions.length}
              totalPages={totalPages}
              onPreviousPage={handlePreviousPageClick}
              onNextPage={handleNextPageClick}
              onSpecificPage={handleSpecificPageClick}
            />
          </div>
        </div>
      )}
    </ArmorInfoContainer>
  )
}

function ArmorInfoContainer({
  children,
  isDialogOpen,
  itemInfo,
  isItemInfoOpen,
  onDialogClose,
  onInfoClose,
}: {
  children: React.ReactNode
  isDialogOpen: boolean
  itemInfo: Item | null
  isItemInfoOpen: boolean
  onDialogClose: () => void
  onInfoClose: () => void
}) {
  return (
    <Dialog
      title="Armor Calculator"
      subtitle="Get optimal armor values for this build."
      maxWidthClass="max-w-2xl"
      open={isDialogOpen}
      onClose={onDialogClose}
    >
      <ItemInfoDialog
        item={itemInfo}
        open={isItemInfoOpen}
        onClose={onInfoClose}
      />
      <div className="flex flex-col items-center justify-start sm:pr-4">
        <h2 className="mb-4 text-2xl font-semibold text-secondary-500">
          Armor Suggestions
        </h2>
        {children}
      </div>
    </Dialog>
  )
}
