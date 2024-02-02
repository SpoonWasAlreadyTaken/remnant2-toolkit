'use client'

import CopyBuildUrlButton from '../../../features/profile/CopyBuildUrlButton'
import usePagination from '@/features/pagination/usePagination'
import { useEffect, useState } from 'react'
import BuildCard from '@/features/build/components/BuildCard'
import BuildListFilters from '@/features/build/components/BuildListFilters'
import BuildList from '@/features/build/components/BuildList'
import DuplicateBuildButton from '../../../features/profile/DuplicateBuildButton'
import { DBBuild } from '@/features/build/types'
import Tabs from '../../../features/profile/Tabs'
import ProfileHeader from '../../../features/profile/ProfileHeader'
import { useSession } from 'next-auth/react'
import AuthWrapper from '@/features/auth/components/AuthWrapper'
import { SortFilter, getFavoritedBuilds } from './actions'

export default function Page() {
  const { data: sessionData } = useSession()
  const [builds, setBuilds] = useState<DBBuild[]>([])
  const [totalBuildCount, setTotalBuildCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [sortFilter, setSortFilter] = useState<SortFilter>('date favorited')
  const itemsPerPage = 16

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
      setIsLoading(true)
      const response = await getFavoritedBuilds({
        itemsPerPage,
        pageNumber: currentPage,
        sortFilter,
      })
      setBuilds(response.items)
      setTotalBuildCount(response.totalItemCount)
      setIsLoading(false)
    }
    getItemsAsync()
  }, [currentPage, itemsPerPage, sortFilter])

  const filterOptions: SortFilter[] = ['date favorited', 'upvotes']

  function handleFilterChange(filter: string) {
    setSortFilter(filter as SortFilter)
  }

  return (
    <AuthWrapper>
      {sessionData?.user && (
        <ProfileHeader
          editable={true}
          userId={sessionData.user.id}
          image={sessionData.user.image}
        />
      )}
      <div className="mb-8 flex w-full flex-col items-center">
        <Tabs />
      </div>
      <BuildList
        label="Builds you've favorited"
        currentPage={currentPage}
        pageNumbers={pageNumbers}
        totalItems={totalBuildCount}
        totalPages={totalPages}
        isLoading={isLoading}
        firstVisibleItemNumber={firstVisibleItemNumber}
        lastVisibleItemNumber={lastVisibleItemNumber}
        onPreviousPage={handlePreviousPageClick}
        onNextPage={handleNextPageClick}
        onSpecificPage={handleSpecificPageClick}
        headerActions={
          <div className="min-w-[150px] max-w-[250px]">
            <BuildListFilters
              filter={sortFilter}
              onFilterChange={handleFilterChange}
              options={filterOptions}
            />
          </div>
        }
      >
        {builds.map((build) => (
          <div key={build.id} className="h-full w-full">
            <BuildCard
              build={build}
              onReportBuild={undefined}
              footerActions={
                <div className="flex items-center justify-between gap-2 p-2 text-sm">
                  <CopyBuildUrlButton buildId={build.id} />
                  <DuplicateBuildButton build={build} />
                </div>
              }
            />
          </div>
        ))}
      </BuildList>
    </AuthWrapper>
  )
}
