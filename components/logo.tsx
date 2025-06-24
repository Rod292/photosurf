import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  className?: string
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link href="/" className={`block ${className}`}>
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogo-xMYAYJOiOump9MB6uIiVHITxI2mXGG.png"
        alt="Arode Studio"
        width={100}
        height={100}
        className="w-auto h-8"
        priority
      />
    </Link>
  )
}

