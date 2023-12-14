import { WeaponItem, type Build, TraitItem } from '@/types'
import { Fragment, useCallback, useMemo, useState } from 'react'
import useQueryString from '@/hooks/useQueryString'
import { type Item, type ItemCategory } from '@/types'
import { remnantItems } from '@/data'
import { cn, getArrayOfLength } from '@/lib/utils'
import BuildName from './BuildName'
import ImageBuilderButton from './ImageBuilderButton'
import Traits from './Traits'
import ItemSelect from './ItemSelect'

/**
 * Returns a list of items that match the selected slot
 * Takes into account the build's current items and the selected slot
 * This is passed to the ItemSelect modal to display the correct items
 */
function getItemListForSlot(
  build: Build,
  selectedItemSlot: {
    category: ItemCategory | null
    index?: number
  },
) {
  if (!selectedItemSlot.category) return []

  // Remove items that are already in the build
  const unequippedItems = remnantItems.filter((item) => {
    const categoryItemorItems = build.items[item.category]

    if (!categoryItemorItems) return true

    if (Array.isArray(categoryItemorItems)) {
      const buildItems = categoryItemorItems
      return !buildItems.find((i) => i?.id === item.id)
    } else {
      const buildItem = categoryItemorItems
      return buildItem?.id !== item.id
    }
  })

  // If the selected slot is a weapon, then limit the
  // weapons based on the corresponding weapon type
  if (selectedItemSlot.category === 'weapon') {
    let type: WeaponItem['type']
    switch (selectedItemSlot.index) {
      case 0:
        type = 'long gun'
        break
      case 1:
        type = 'melee'
        break
      case 2:
        type = 'hand gun'
        break
    }

    return (unequippedItems as WeaponItem[]).filter(
      (item) => item.type === type,
    )
  }

  // If the selected slot is a skill, try to limit
  // skills based on the corresponding archtype
  if (selectedItemSlot.category === 'skill') {
    const skillItems = (unequippedItems as Item[]).filter(
      (item) => item.category === 'skill',
    )

    if (selectedItemSlot.index === undefined) return skillItems

    const archtype =
      build.items.archtype[selectedItemSlot.index]?.name.toLowerCase()

    if (!archtype) return skillItems

    const itemsForArchtype = skillItems.filter(
      (item) => item.linkedItems?.archtype?.name.toLowerCase() === archtype,
    )

    return itemsForArchtype
  }

  // If the selected slot is an archtype, try to limit
  // the archtypes based on the corresponding skill
  if (selectedItemSlot.category === 'archtype') {
    const archtypeItems = (unequippedItems as Item[]).filter(
      (item) => item.category === 'archtype',
    )

    if (selectedItemSlot.index === undefined) return archtypeItems

    const skill = build.items.skill[selectedItemSlot.index]?.name.toLowerCase()

    if (!skill) return archtypeItems

    const itemsForSkill = archtypeItems.filter(
      (item) =>
        item.linkedItems?.skills?.some((s) => s.name.toLowerCase() === skill),
    )

    return itemsForSkill
  }

  // If we got this far, then return all items for the selected slot
  return (unequippedItems as Item[]).filter(
    (item) => item.category === selectedItemSlot.category,
  )
}

export default function ImageBuilder({
  showControls,
  showLabels,
}: {
  showControls: boolean
  showLabels: boolean
}) {
  // Hook for modifying the URL query string
  const { updateQueryString, currentBuild } = useQueryString()

  // Tracks information about the slot the user is selecting an item for
  const [selectedItemSlot, setSelectedItemSlot] = useState<{
    category: ItemCategory | null
    index?: number
  }>({ category: null })

  /**
   * Fires when the user changes an item in the build.
   *
   * If the item is null, the item is removed from the build
   * and from the query string.
   *
   * If the item is not null, the item is added to the build
   * and the query string is updated.
   */
  const handleSelectItem = useCallback(
    (selectedItem: Item | null) => {
      if (!selectedItemSlot.category) return

      /**
       * The item index is used to determine which item in the array of items
       * for slots like rings and archtypes
       */
      const specifiedIndex = selectedItemSlot.index
      const isIndexSpecified = specifiedIndex !== undefined

      // If the item is null, remove the item from the build
      // and from the query string
      // If the item can be multiple, such as rings,
      // then remove the item at the specified index
      if (!selectedItem) {
        if (isIndexSpecified) {
          const buildItems = currentBuild.items[selectedItemSlot.category]

          if (!Array.isArray(buildItems)) return

          // We can't filter here because we want to preserve the index
          // If we filtered, the second archtype would become the first archtype
          // if you removed the first archtype
          const newBuildItems = buildItems.map((item, index) =>
            index === specifiedIndex ? null : item,
          )
          const newItemIds = newBuildItems.map((i) => (i ? i.id : ''))
          updateQueryString(selectedItemSlot.category, newItemIds)
        } else {
          updateQueryString(selectedItemSlot.category, '')
        }

        setSelectedItemSlot({ category: null })
        return
      }

      const categoryItemorItems = currentBuild.items[selectedItemSlot.category]

      // If the item can be multiple, such as rings,
      // then add the item at the specified index
      if (Array.isArray(categoryItemorItems)) {
        const buildItems = categoryItemorItems

        const itemAlreadyInBuild = buildItems.find(
          (i) => i?.id === selectedItem.id,
        )
        if (itemAlreadyInBuild) return

        /** Used to add the new item to the array of items for this slot */
        const newBuildItems = [...buildItems]

        const specifiedIndex = selectedItemSlot.index
        const isIndexSpecified = specifiedIndex !== undefined

        isIndexSpecified
          ? (newBuildItems[specifiedIndex] = selectedItem)
          : newBuildItems.push(selectedItem)

        // If the item is a trait, then we need to add the amount to the query string
        if (selectedItemSlot.category === 'trait') {
          const newTraitItemParams = newBuildItems.map(
            (i) => `${i.id};${(i as TraitItem).amount}`,
          )
          updateQueryString('trait', newTraitItemParams)
          setSelectedItemSlot({ category: null })
          return
        }

        // If we got here, add the item to the build
        const newItemIds = newBuildItems.map((i) => i?.id)
        updateQueryString(selectedItem.category, newItemIds)
        setSelectedItemSlot({ category: null })
        return
      }

      // If the item is not null, add the item to the build
      const buildItem = categoryItemorItems

      const itemAlreadyInBuild = buildItem?.id === selectedItem.id
      if (itemAlreadyInBuild) return

      updateQueryString(selectedItem.category, selectedItem.id)
      setSelectedItemSlot({ category: null })
    },
    [
      currentBuild.items,
      selectedItemSlot.category,
      selectedItemSlot.index,
      updateQueryString,
    ],
  )

  /** If the item category is null, modal is closed */
  const isItemSelectModalOpen = Boolean(selectedItemSlot.category)

  //Tracks whether the build name is editable or not.
  const [buildNameIsEditable, setBuildNameIsEditable] = useState(false)

  /**
   * Returns a list of items that match the selected slot
   * This is passed to the ItemSelect modal to display the correct items
   */
  const itemListForSlot = useMemo(
    () => getItemListForSlot(currentBuild, selectedItemSlot),
    [selectedItemSlot, currentBuild],
  )

  return (
    <Fragment>
      <ItemSelect
        open={isItemSelectModalOpen}
        onClose={() => setSelectedItemSlot({ category: null })}
        onSelectItem={handleSelectItem}
        itemList={itemListForSlot}
        buildSlot={selectedItemSlot.category}
      />

      <div className="mb-4">
        <BuildName
          editable={buildNameIsEditable}
          onClick={() => setBuildNameIsEditable(true)}
          onClose={(newBuildName: string) => {
            updateQueryString('name', newBuildName)
            setBuildNameIsEditable(false)
          }}
          name={currentBuild.name}
          showControls={showControls}
        />
      </div>

      <div className="flex w-full items-start justify-between gap-4">
        <div id="left-column" className="flex-none">
          <ImageBuilderButton
            item={currentBuild.items.helm}
            showLabels={showLabels}
            onClick={() => {
              setSelectedItemSlot({
                category: 'helm',
              })
            }}
          />
          <ImageBuilderButton
            item={currentBuild.items.torso}
            showLabels={showLabels}
            onClick={() => {
              setSelectedItemSlot({
                category: 'torso',
              })
            }}
          />
          <ImageBuilderButton
            item={currentBuild.items.legs}
            showLabels={showLabels}
            onClick={() => {
              setSelectedItemSlot({
                category: 'legs',
              })
            }}
          />
          <ImageBuilderButton
            item={currentBuild.items.gloves}
            showLabels={showLabels}
            onClick={() => {
              setSelectedItemSlot({
                category: 'gloves',
              })
            }}
          />
          <div
            id="relic-container"
            className="relative flex items-start justify-start"
          >
            <ImageBuilderButton
              item={currentBuild.items.relic}
              showLabels={showLabels}
              onClick={() => {
                setSelectedItemSlot({
                  category: 'relic',
                })
              }}
            />
            <div
              id="relic-fragment-container"
              className="absolute left-[66px] top-0 flex w-[160px] flex-col items-start justify-start"
            >
              <ImageBuilderButton
                showLabels={showLabels}
                size="sm"
                item={currentBuild.items.relicfragment[0]}
                onClick={() => {
                  setSelectedItemSlot({
                    category: 'relicfragment',
                    index: 0,
                  })
                }}
              />
              <ImageBuilderButton
                item={currentBuild.items.relicfragment[1]}
                showLabels={showLabels}
                size="sm"
                onClick={() => {
                  setSelectedItemSlot({
                    category: 'relicfragment',
                    index: 1,
                  })
                }}
              />
              <ImageBuilderButton
                item={currentBuild.items.relicfragment[2]}
                showLabels={showLabels}
                size="sm"
                onClick={() => {
                  setSelectedItemSlot({
                    category: 'relicfragment',
                    index: 2,
                  })
                }}
              />
            </div>
          </div>
        </div>

        <div
          id="center-column"
          className={cn(
            'relative ml-[13px] flex h-[290px] max-h-[290px] flex-col items-start justify-start overflow-y-scroll',

            'sm:h-[375px] sm:max-h-[375px]',
          )}
        >
          <div
            id="archtype-container"
            className="flex flex-row flex-wrap gap-2"
          >
            {getArrayOfLength(2).map((archtypeIndex) => (
              <Fragment key={`archtype-${archtypeIndex}`}>
                <ImageBuilderButton
                  item={currentBuild.items.archtype[archtypeIndex]}
                  showLabels={showLabels}
                  onClick={() => {
                    setSelectedItemSlot({
                      category: 'archtype',
                      index: archtypeIndex,
                    })
                  }}
                />
                <ImageBuilderButton
                  item={currentBuild.items.skill[archtypeIndex]}
                  showLabels={showLabels}
                  onClick={() => {
                    setSelectedItemSlot({
                      category: 'skill',
                      index: archtypeIndex,
                    })
                  }}
                />
              </Fragment>
            ))}
          </div>

          <div
            id="concoction-container"
            className="flex flex-row flex-wrap gap-2"
          >
            <ImageBuilderButton
              item={currentBuild.items.concoction[0]}
              showLabels={showLabels}
              onClick={() => {
                setSelectedItemSlot({
                  category: 'concoction',
                  index: 0,
                })
              }}
            />
            {getArrayOfLength(3).map((index) => {
              // Skip the first concoction, since it's already been rendered
              const concoctionIndex = index + 1

              // Skip the concoctions if the build is not an alchemist
              const isPrimaryAlchemist =
                currentBuild.items.archtype[0]?.name?.toLowerCase() ===
                'alchemist'
              if (!isPrimaryAlchemist) return null

              return (
                <ImageBuilderButton
                  key={`concoction-${concoctionIndex}`}
                  item={currentBuild.items.concoction[concoctionIndex]}
                  showLabels={showLabels}
                  onClick={() => {
                    setSelectedItemSlot({
                      category: 'concoction',
                      index: concoctionIndex,
                    })
                  }}
                />
              )
            })}
          </div>

          <div
            id="consumable-container"
            className="flex flex-row flex-wrap gap-2"
          >
            {getArrayOfLength(4).map((consumableIndex) => (
              <ImageBuilderButton
                key={`consumable-${consumableIndex}`}
                item={currentBuild.items.consumable[consumableIndex]}
                showLabels={showLabels}
                onClick={() => {
                  setSelectedItemSlot({
                    category: 'consumable',
                    index: consumableIndex,
                  })
                }}
              />
            ))}
          </div>
        </div>

        <div id="right-column" className="flex-none">
          <ImageBuilderButton
            item={currentBuild.items.amulet}
            showLabels={showLabels}
            onClick={() => {
              setSelectedItemSlot({
                category: 'amulet',
              })
            }}
          />
          {getArrayOfLength(4).map((ringIndex) => (
            <ImageBuilderButton
              showLabels={showLabels}
              item={currentBuild.items.ring[ringIndex]}
              key={`ring-${ringIndex}`}
              onClick={() => {
                setSelectedItemSlot({
                  category: 'ring',
                  index: ringIndex,
                })
              }}
            />
          ))}
        </div>
      </div>

      <div
        id="guns-row"
        className="flex w-full flex-row items-start justify-start gap-2 overflow-x-scroll"
      >
        {getArrayOfLength(3).map((weaponIndex) => (
          <div
            key={`gun-${weaponIndex}`}
            className="flex flex-col items-start justify-center"
          >
            <ImageBuilderButton
              showLabels={showLabels}
              item={currentBuild.items.weapon[weaponIndex]}
              size="wide"
              onClick={() => {
                setSelectedItemSlot({
                  category: 'weapon',
                  index: weaponIndex,
                })
              }}
            />
            <div className="flex w-full grow items-center justify-around gap-4">
              <ImageBuilderButton
                showLabels={showLabels}
                item={currentBuild.items.mod[weaponIndex]}
                size="md"
                onClick={() => {
                  setSelectedItemSlot({
                    category: 'mod',
                    index: weaponIndex,
                  })
                }}
              />
              <ImageBuilderButton
                item={currentBuild.items.mutator[weaponIndex]}
                showLabels={showLabels}
                size="md"
                onClick={() => {
                  setSelectedItemSlot({
                    category: 'mutator',
                    index: weaponIndex,
                  })
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div id="trait-row" className="mt-4 w-full">
        <Traits
          traitItems={currentBuild.items.trait}
          showControls={showControls}
          onAddTrait={() => {
            setSelectedItemSlot({
              category: 'trait',
            })
          }}
          onRemoveTrait={(traitItem) => {
            const newTraitItems = currentBuild.items.trait.filter(
              (i) => i.name !== traitItem.name,
            )
            const newTraitItemParams = newTraitItems.map(
              (i) => `${i.id};${i.amount}`,
            )
            updateQueryString('trait', newTraitItemParams)
          }}
          onChangeAmount={(newTraitItem) => {
            const newTraitItems = currentBuild.items.trait.map((traitItem) => {
              if (traitItem.name === newTraitItem.name) {
                return newTraitItem
              }
              return traitItem
            })
            const newTraitItemParams = newTraitItems.map(
              (i) => `${i.id};${i.amount}`,
            )
            updateQueryString('trait', newTraitItemParams)
          }}
        />
      </div>
    </Fragment>
  )
}
