'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { ProductSelection } from './ProductSelection';
import { HeartButton } from '@/components/ui/heart-button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Photo } from '@/lib/database.types';
import { formatPrice } from '@/lib/utils';

interface PhotoCardProps {
  photo: Photo;
  className?: string;
}

export function PhotoCard({ photo, className }: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card 
        className={`group overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-0">
          <div className="relative w-full pt-[150%] overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src={photo.preview_s3_url}
                alt={photo.filename}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
            
            {/* Cart button - top left corner */}
            <div className="absolute top-3 left-3 z-10">
              <AddToCartButton
                photo={photo}
                productType="digital"
                price={1500}
                size="sm"
                className="w-8 h-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-lg text-xs"
                showIcon={false}
              >
                <Image
                  src="/Logos/shopping-cart.svg"
                  alt="Ajouter au panier"
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
              </AddToCartButton>
            </div>

            {/* Heart button - top right corner */}
            <div className="absolute top-3 right-3 z-10">
              <HeartButton 
                photo={{
                  id: photo.id,
                  gallery_id: photo.gallery_id,
                  gallery_name: photo.gallery?.name,
                  preview_url: photo.preview_s3_url
                }}
                size="sm"
              />
            </div>
            
            {/* Overlay with actions */}
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <p className="text-lg font-semibold">
                      À partir de {formatPrice(1500)}
                    </p>
                    <p className="text-sm opacity-90">
                      {photo.filename}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                  
                  <AddToCartButton
                    photo={photo}
                    productType="digital"
                    price={1500}
                    size="sm"
                    className="flex-1"
                  >
                    <Image
                      src="/Logos/shopping-cart.svg"
                      alt="Shopping Cart"
                      width={16}
                      height={16}
                      className="h-4 w-4 mr-2 inline-block"
                    />
                    Ajouter
                  </AddToCartButton>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Photo */}
            <div className="relative bg-black">
              <Image
                src={photo.preview_s3_url}
                alt={photo.filename}
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Product Selection */}
            <div className="p-6 overflow-y-auto">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl">
                  {photo.filename}
                </DialogTitle>
              </DialogHeader>
              
              <ProductSelection photo={photo} />
              
              <div className="mt-6 pt-6 border-t text-sm text-muted-foreground">
                <p>
                  • Photos en haute résolution (3000+ pixels)
                </p>
                <p>
                  • Retouches professionnelles incluses
                </p>
                <p>
                  • Livraison immédiate par email
                </p>
                <p>
                  • Liens de téléchargement valides 48h
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}