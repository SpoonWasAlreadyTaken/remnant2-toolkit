'use server'

import { DEFAULT_DISPLAY_NAME } from '@/app/(data)/constants'
import { PaginationResponse } from '@/app/(hooks)/usePagination'
import { getServerSession } from '@/app/(lib)/auth'
import { prisma } from '@/app/(lib)/db'
import { ExtendedBuild } from '@/app/(types)/build'
import { SearchFilters } from './page'

export async function getBuilds({
  itemsPerPage,
  pageNumber,
  searchFilters,
  discoveredItemIds,
}: {
  itemsPerPage: number
  pageNumber: number
  searchFilters: SearchFilters
  discoveredItemIds: string[]
}): Promise<PaginationResponse<ExtendedBuild>> {
  const session = await getServerSession()
  const userId = session?.user?.id

  const whereClause = {
    isPublic: true,
    ...(searchFilters.ownedItemsOnly
      ? {
          AND: [
            {
              OR: [
                { helm: { equals: null } },
                { helm: { equals: '' } },
                ...discoveredItemIds.map((itemId) => ({
                  helm: { contains: itemId },
                })),
              ],
            },
            {
              OR: [
                { gloves: { equals: null } },
                { gloves: { equals: '' } },
                ...discoveredItemIds.map((itemId) => ({
                  gloves: { contains: itemId },
                })),
              ],
            },
            {
              OR: [
                { torso: { equals: null } },
                { torso: { equals: '' } },
                ...discoveredItemIds.map((itemId) => ({
                  torso: { contains: itemId },
                })),
              ],
            },
            {
              OR: [
                { legs: { equals: null } },
                { legs: { equals: '' } },
                ...discoveredItemIds.map((itemId) => ({
                  legs: { contains: itemId },
                })),
              ],
            },
            {
              OR: [
                { relic: { equals: null } },
                { relic: { equals: '' } },
                ...discoveredItemIds.map((itemId) => ({
                  relic: { contains: itemId },
                })),
              ],
            },
            {
              OR: [
                { amulet: { equals: null } },
                { amulet: { equals: '' } },
                ...discoveredItemIds.map((itemId) => ({
                  amulet: { contains: itemId },
                })),
              ],
            },
            {
              OR: [
                { weapon: { equals: null } },
                { weapon: { equals: '' } },
                ...discoveredItemIds.map((itemId) => ({
                  weapon: { contains: itemId },
                })),
              ],
            },
            {
              OR: [
                { ring: { equals: null } },
                { ring: { equals: '' } },
                ...discoveredItemIds.map((itemId) => ({
                  ring: { contains: itemId },
                })),
              ],
            },
            {
              OR: [
                { archtype: { equals: null } },
                { archtype: { equals: '' } },
                ...discoveredItemIds.map((itemId) => ({
                  archtype: { contains: itemId },
                })),
              ],
            },
            {
              OR: [
                { relicfragment: { equals: null } },
                { relicfragment: { equals: '' } },
                ...discoveredItemIds.map((itemId) => ({
                  relicfragment: { contains: itemId },
                })),
              ],
            },
            {
              OR: [
                { mutator: { equals: null } },
                { mutator: { equals: '' } },
                ...discoveredItemIds.map((itemId) => ({
                  mutator: { contains: itemId },
                })),
              ],
            },
            // {
            //   OR: [
            //     { mod: { equals: null } },
            //     ...discoveredItemIds.map((itemId) => ({
            //       mod: { contains: itemId },
            //     })),
            //   ],
            // },
            // {
            //   OR: [
            //     { trait: { equals: null } },
            //     { trait: { equals: '' } },
            //     ...discoveredItemIds.map((itemId) => ({
            //       trait: { contains: itemId },
            //     })),
            //   ],
            // },
          ],
        }
      : {}),
  }

  const builds = await prisma.build.findMany({
    where: whereClause,
    include: {
      createdBy: true,
      BuildVotes: true,
      BuildReports: true,
    },
    orderBy: {
      BuildVotes: {
        _count: 'desc',
      },
    },
    skip: (pageNumber - 1) * itemsPerPage,
    take: itemsPerPage,
  })

  const totalBuildCount = await prisma.build.count({
    where: {
      isPublic: true,
    },
  })

  if (!builds) return { items: [], totalItemCount: 0 }

  const returnedBuilds: ExtendedBuild[] = builds.map((build) => ({
    ...build,
    createdByDisplayName:
      build.createdBy?.displayName ||
      build.createdBy?.name ||
      DEFAULT_DISPLAY_NAME,
    totalUpvotes: build.BuildVotes.length, // Count the votes
    upvoted: build.BuildVotes.some((vote) => vote.userId === userId), // Check if the user upvoted the build
    reported: build.BuildReports.some((report) => report.userId === userId), // Check if the user reported the build
    isMember: false,
  })) satisfies ExtendedBuild[]

  return { items: returnedBuilds, totalItemCount: totalBuildCount }
}