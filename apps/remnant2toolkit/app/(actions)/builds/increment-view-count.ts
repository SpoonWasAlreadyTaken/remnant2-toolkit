'use server'

import { prisma } from '@repo/db'

import { getServerSession } from '@/app/(features)/auth'
import type { BuildActionResponse } from '@/app/(types)/builds'

export async function incrementViewCount({
  buildId,
}: {
  buildId: string
}): Promise<BuildActionResponse> {
  const session = await getServerSession()
  const userId = session?.user?.id

  try {
    // If the build is created by the user, do not add a view
    if (userId) {
      const build = await prisma.build.findUnique({
        where: {
          id: buildId,
        },
        select: {
          createdById: true,
        },
      })

      if (build?.createdById === userId) {
        return {
          message:
            'View count not incremented as the build is created by the user!',
        }
      }
    }

    await prisma.build.update({
      where: {
        id: buildId,
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    return {
      message: 'View count incremented!',
    }
  } catch (e) {
    console.error(`Error in incrementing view count for build ${buildId}!`)
    return {
      errors: ['Error in incrementing view count!'],
    }
  }
}
