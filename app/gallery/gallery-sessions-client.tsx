"use client"

import { useState } from "react"
import Image from "next/image"
import { SupabaseImage } from "@/components/ui/supabase-image"
import Link from "next/link"
import { motion } from "framer-motion"
import { StaggerContainer, StaggerItem } from "@/components/animations/page-transition"

interface GallerySessionsClientProps {
  galleries: any[]
}

export function GallerySessionsClient({ galleries }: GallerySessionsClientProps) {
  // Chaque galerie est une session séparée
  const sessionsWithPhotos = galleries
    .filter((gallery: any) => gallery.photos && gallery.photos.length > 0)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 font-dm-sans">
          Sessions par jour
        </h2>
        
        {sessionsWithPhotos.length === 0 ? (
          <div className="text-center py-8">
            <div className="mb-4 flex justify-center">
              <Image
                src="/Logos/camera2.svg"
                alt="Camera"
                width={96}
                height={96}
                className="w-24 h-24"
              />
            </div>
            <h3 className="text-2xl font-semibold mb-4">
              Aucune session disponible
            </h3>
            <p className="text-gray-600">
              Les nouvelles sessions seront bientôt disponibles !
            </p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            {sessionsWithPhotos.map((gallery: any, index: number) => (
              <StaggerItem key={gallery.id}>
                <Link href={`/gallery/${gallery.id}`} className="block">
                  <motion.div
                    className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden group"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600">
                      {gallery.photos && gallery.photos.length > 0 ? (
                        <SupabaseImage
                          src={gallery.photos[0].preview_s3_url}
                          alt={`Photos de ${gallery.name}`}
                          width={400}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image
                            src="/Logos/camera2.svg"
                            alt="Camera"
                            width={40}
                            height={40}
                            className="w-10 h-10"
                            style={{ filter: 'brightness(0) invert(1)' }}
                          />
                        </div>
                      )}
                      
                      {/* Badge du nombre de photos */}
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {gallery.photos?.length || 0} photos
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {gallery.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {new Date(gallery.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      
                      {/* École de surf si disponible */}
                      {gallery.surf_schools && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <Image
                            src="/Logos/surfer.svg"
                            alt="Surf school"
                            width={16}
                            height={16}
                            className="w-4 h-4"
                          />
                          <span>{gallery.surf_schools.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-600">
                          {gallery.photos?.length || 0} photo{(gallery.photos?.length || 0) > 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(gallery.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  )
}