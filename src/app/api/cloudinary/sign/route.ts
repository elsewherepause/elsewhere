import { auth } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { folder = 'elsewhere' } = await req.json().catch(() => ({}))

  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign: Record<string, string | number> = { folder, timestamp }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  )

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  })
}
