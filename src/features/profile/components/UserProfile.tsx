'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { BuildCard } from '@/features/build/components/build-card/BuildCard'
import { ItemList } from '@/features/build/components/ItemList'
import { useBuildListState } from '@/features/build/hooks/useBuildListState'
import { BuildListSecondaryFilters } from '@/features/filters/components/BuildListSecondaryFilters'
import { useBuildListSecondaryFilters } from '@/features/filters/hooks/useBuildListSecondaryFilters'
import { parseBuildListFilters } from '@/features/filters/lib/parseBuildListFilters'
import { usePagination } from '@/features/pagination/usePagination'
import { CopyBuildUrlButton } from '@/features/profile/components/CopyBuildUrlButton'
import { DuplicateBuildButton } from '@/features/profile/components/DuplicateBuildButton'
import { EditBuildButton } from '@/features/profile/components/EditBuildButton'
import { Skeleton } from '@/features/ui/Skeleton'

import { getUserProfilePage } from '../../../app/profile/[userId]/actions'

interface Props {
  itemsPerPage?: number
  userId: string
}

export function UserProfile({ itemsPerPage = 8, userId }: Props) {
  const searchParams = useSearchParams()
  const [buildListFilters, setBuildListFilters] = useState(
    parseBuildListFilters(searchParams),
  )
  useEffect(() => {
    setBuildListFilters(parseBuildListFilters(searchParams))
  }, [searchParams])

  const { buildListState, setBuildListState } = useBuildListState()
  const { builds, totalBuildCount, isLoading } = buildListState

  const {
    orderBy,
    orderByOptions,
    timeRange,
    timeRangeOptions,
    handleOrderByChange,
    handleTimeRangeChange,
  } = useBuildListSecondaryFilters()

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
    totalItemCount: totalBuildCount,
    itemsPerPage,
  })

  useEffect(() => {
    const getItemsAsync = async () => {
      if (!buildListFilters) {
        return
      }
      setBuildListState((prevState) => ({ ...prevState, isLoading: true }))
      const response = await getUserProfilePage({
        buildListFilters,
        itemsPerPage,
        orderBy,
        pageNumber: currentPage,
        timeRange,
        userId,
      })
      setBuildListState((prevState) => ({
        ...prevState,
        isLoading: false,
        builds: response.items,
        totalBuildCount: response.totalItemCount,
      }))
    }
    getItemsAsync()
  }, [
    buildListFilters,
    currentPage,
    itemsPerPage,
    orderBy,
    setBuildListState,
    timeRange,
    userId,
  ])

  if (!buildListFilters) {
    return <Skeleton className="min-h-[1100px] w-full" />
  }

  return (
    <>
      <ItemList
        label="Created Builds"
        currentPage={currentPage}
        isLoading={isLoading}
        pageNumbers={pageNumbers}
        totalItems={totalBuildCount}
        totalPages={totalPages}
        firstVisibleItemNumber={firstVisibleItemNumber}
        lastVisibleItemNumber={lastVisibleItemNumber}
        onPreviousPage={handlePreviousPageClick}
        onNextPage={handleNextPageClick}
        onSpecificPage={handleSpecificPageClick}
        headerActions={
          <BuildListSecondaryFilters
            orderBy={orderBy}
            orderByOptions={orderByOptions}
            onOrderByChange={handleOrderByChange}
            timeRange={timeRange}
            timeRangeOptions={timeRangeOptions}
            onTimeRangeChange={handleTimeRangeChange}
          />
        }
      >
        <ul
          role="list"
          className="my-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {builds.map((build) => (
            <div key={build.id} className="h-full w-full">
              <BuildCard
                build={build}
                isLoading={isLoading}
                onReportBuild={undefined}
                memberFrameEnabled={build.isMember}
                footerActions={
                  <div className="flex items-center justify-between gap-2 p-2 text-sm">
                    <CopyBuildUrlButton buildId={build.id} />
                    <EditBuildButton buildId={build.id} />
                    <DuplicateBuildButton build={build} />
                  </div>
                }
              />
            </div>
          ))}
        </ul>
      </ItemList>
    </>
  )
}
