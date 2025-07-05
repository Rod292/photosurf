'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Image as ImageIcon, Package } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import { ProductType } from '@/contexts/CartContext';
import type { Photo } from '@/lib/database.types';
import { formatPrice } from '@/lib/utils';

interface ProductOption {
  type: ProductType;
  name: string;
  description: string;
  price: number; // in cents
  icon: React.ReactNode;
  badge?: string;
}

interface ProductSelectionProps {
  photo: Photo;
  className?: string;
}

const productOptions: ProductOption[] = [
  {
    type: 'digital',
    name: 'Photo Numérique',
    description: 'Téléchargement haute résolution (JPEG)',
    price: 1500, // 15€ in cents
    icon: <Download className="h-5 w-5" />,
  },
  {
    type: 'print',
    name: 'Tirage Photo',
    description: 'Impression professionnelle A4 (21x29.7cm)',
    price: 2500, // 25€ in cents
    icon: <ImageIcon className="h-5 w-5" />,
  },
];

export function ProductSelection({ photo, className }: ProductSelectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('digital');

  const selectedOption = productOptions.find(option => option.type === selectedProduct);

  return (
    <div className={className}>
      <div className="space-y-3 mb-6">
        <h3 className="font-medium text-lg">Choisissez votre format</h3>
        
        <div className="grid gap-3">
          {productOptions.map((option) => (
            <Card 
              key={option.type}
              className={`cursor-pointer transition-all ${
                selectedProduct === option.type 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedProduct(option.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 text-primary">
                      {option.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{option.name}</h4>
                        {option.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {option.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {formatPrice(option.price)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bundle Option */}
        <Card 
          className={`cursor-pointer transition-all border-2 border-dashed border-primary/30 bg-primary/5 ${
            selectedProduct === 'digital' ? 'hover:border-primary/50' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Pack Complet</h4>
                    <Badge className="text-xs bg-green-100 text-green-800">
                      Économisez 5€
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Numérique + Tirage A4
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground line-through">
                  {formatPrice(4000)}
                </div>
                <div className="font-semibold text-lg text-green-600">
                  {formatPrice(3500)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedOption && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">{selectedOption.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedOption.description}
              </p>
            </div>
            <div className="font-semibold text-lg">
              {formatPrice(selectedOption.price)}
            </div>
          </div>

          <AddToCartButton
            photo={photo}
            productType={selectedProduct}
            price={selectedOption.price}
            className="w-full"
            size="lg"
          />
        </div>
      )}
    </div>
  );
}