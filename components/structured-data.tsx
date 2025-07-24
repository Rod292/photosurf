import type { FC } from "react"

interface StructuredDataProps {
  title?: string
  description?: string
  imageUrl?: string
  page?: 'home' | 'gallery' | 'about' | 'contact'
}

const StructuredData: FC<StructuredDataProps> = ({ 
  title = "Photos Surf La Torche | Arode Studio", 
  description = "Photographe professionnel de surf à La Torche, Bretagne",
  imageUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogowhitepng-HNnXW50qCnMuNb7pxKVPk3x4zxq9mP.png",
  page = 'home'
}) => {
  
  // Schema.org pour Business Local
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.arodestudio.com/#business",
    name: "Arode Studio",
    description: "Photographe professionnel de surf à La Torche, spécialisé dans l'immortalisation des sessions de surf en Bretagne",
    url: "https://www.arodestudio.com",
    telephone: "contact@arodestudio.com",
    email: "contact@arodestudio.com",
    image: imageUrl,
    logo: imageUrl,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      addressLocality: "La Torche",
      addressRegion: "Bretagne",
      addressCountry: "FR",
      postalCode: "29120"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 47.8369,
      longitude: -4.3369
    },
    areaServed: {
      "@type": "Place",
      name: "La Torche, Bretagne, France"
    },
    serviceType: "Photographie de surf",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services de Photographie Surf",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Photos numériques de surf",
            description: "Photos haute résolution de vos sessions de surf à La Torche"
          }
        },
        {
          "@type": "Offer", 
          itemOffered: {
            "@type": "Service",
            name: "Tirages photos de surf",
            description: "Impressions professionnelles de vos photos de surf"
          }
        }
      ]
    },
    sameAs: [
      "https://www.instagram.com/arode.studio/"
    ]
  }

  // Schema.org pour le site web
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.arodestudio.com/#website",
    name: title,
    description: description,
    url: "https://www.arodestudio.com",
    image: imageUrl,
    publisher: {
      "@id": "https://www.arodestudio.com/#business"
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.arodestudio.com/gallery?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    keywords: "photos surf la torche, photographe surf bretagne, session surf finistère, arode studio"
  }

  // Schema.org pour la page d'accueil avec informations spécifiques
  const homePage = page === 'home' ? {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://www.arodestudio.com/#webpage",
    url: "https://www.arodestudio.com",
    name: title,
    description: description,
    isPartOf: {
      "@id": "https://www.arodestudio.com/#website"
    },
    about: {
      "@id": "https://www.arodestudio.com/#business"
    },
    mainContentOfPage: {
      "@type": "CollectionPage",
      name: "Galeries Photos Surf La Torche",
      description: "Collection de photos de surf professionnelles prises à La Torche, Bretagne"
    }
  } : null

  const schemas = [localBusiness, website, homePage].filter(Boolean)

  return (
    <>
      {schemas.map((schema, index) => (
        <script 
          key={index}
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }} 
        />
      ))}
    </>
  )
}

export default StructuredData

