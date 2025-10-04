import { Suspense } from "react"
import { MorphingSearch } from "@/components/morphing-search"
import { ContentFlowAnimation, FlowItem } from "@/components/animations/content-flow-animation"
import { LatestPhotosSectionClient } from "@/components/latest-photos-section-client"
import { PhotosByDate } from "@/components/photos-by-date"
import { PhotosBySchool } from "@/components/photos-by-school"
import { Header } from "@/components/header"
import Image from "next/image"
import Link from "next/link"
import { SimpleCalendar } from "@/components/ui/simple-calendar"
import StructuredData from "@/components/structured-data"
import { notFound } from "next/navigation"
import { LocationPageClient } from "./location-page-client"

const locations = {
  "la-torche": {
    name: "La Torche",
    title: "Vos Photos de Surf à La Torche",
    subtitle: "Photographe Surf Professionnel à La Torche",
    description: "Arode Studio immortalise vos sessions de surf sur le spot emblématique de La Torche, Bretagne",
    zone: "Bretagne, France",
    schoolName: "La Torche Surf School",
    schoolUrl: "https://latorchesurfschool.com/",
    schoolLogo: "/Logos/LOGO-COULEURS.svg",
    coverageArea: {
      title: "La Torche",
      subtitle: "Plomeur, Finistère Sud, Bretagne",
      points: ["Du phare à la pointe", "Tous pics et conditions"]
    }
  },
  "siargao": {
    name: "Siargao",
    title: "Your Surf Photos in Siargao",
    subtitle: "Professional Surf Photographer in Siargao", 
    description: "Arode Studio captures your surf sessions on the paradise spots of Siargao, Philippines",
    zone: "Philippines",
    schoolName: "Siargao Surf Partners",
    schoolUrl: "#",
    schoolLogo: "/Logos/siargao-logo.svg",
    coverageArea: {
      title: "Siargao",
      subtitle: "General Luna, Philippines",
      points: ["Cloud 9 and surroundings", "All island spots"]
    }
  }
}

export default async function LocationPage({ params }: { params: { slug: string } }) {
  const location = locations[params.slug as keyof typeof locations]
  
  if (!location) {
    notFound()
  }

  return (
    <>
      <StructuredData page="location" location={location.name} />
      <LocationPageClient location={location} slug={params.slug} />
    </>
  )
}