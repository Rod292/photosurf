import type { NextPage } from "next"

interface StructuredDataProps {
  title: string
  description: string
  imageUrl: string
}

const StructuredData: NextPage<StructuredDataProps> = ({ title, description, imageUrl }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: title,
    description: description,
    url: "https://www.arodestudio.com",
    image: imageUrl,
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
}

export default StructuredData

