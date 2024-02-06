import { Metadata, ResolvingMetadata } from 'next'
import { getProfile } from './actions'
import ProfilePage from './page'
import { isErrorResponse } from '@/features/error-handling/isErrorResponse'

export async function generateMetadata(
  { params: { userId } }: { params: { userId: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const response = await getProfile(userId)
  if (isErrorResponse(response)) {
    console.error(response.errors)
    throw new Error(
      `Build ${userId} is not found. If you are sure the build exists, it may be marked private.`,
    )
  }

  const { user, profile } = response

  // const previousOGImages = (await parent).openGraph?.images || []
  // const previousTwitterImages = (await parent).twitter?.images || []
  const title = `${user.displayName ?? user.name} Profile on Remnant 2 Toolkit`
  const description =
    profile.bio ?? 'A build for Remnant 2, generated by remnant2toolkit.com'

  return {
    title,
    description,
    openGraph: {
      title,
      description: description,
      url: `https://remnant2builder.com/profile/${user.id}`,
    },
    twitter: {
      title,
      description,
    },
  }
}

export default async function Layout({
  params: { userId },
}: {
  params: { userId: string }
}) {
  return <ProfilePage params={{ userId }} />
}
