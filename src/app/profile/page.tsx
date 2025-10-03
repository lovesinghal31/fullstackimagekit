import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Server component profile page
const ProfilePage = async () => {
  const session = await getServerSession(authOptions)

  console.log("Session:", session)

  if (!session || !session.user) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Profile</h1>
        <p className="text-sm text-muted-foreground">You are not signed in.</p>
      </div>
    )
  }

  const { id, email } = session.user

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      <div className="space-y-1">
        <p><span className="font-medium">User ID:</span> {id}</p>
        <p><span className="font-medium">Email:</span> {email ?? 'N/A'}</p>
      </div>
    </div>
  )
}

export default ProfilePage