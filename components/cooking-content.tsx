"use client"

import Image from "next/image"

export default function CookingContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white pt-20">
      <div className="text-center">
        <p className="text-4xl italic mb-8">let him cook now</p>
        <div className="w-full max-w-4xl mx-auto">
          <Image
            src="/image.png"
            alt="Let him cook"
            width={1920}
            height={1080}
            className="rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </div>
  )
}

