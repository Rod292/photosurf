import { XCircle, ShoppingCart, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const metadata = {
  title: 'Commande annulée - Arode Studio',
  description: 'Votre commande a été annulée',
};

export default function OrderCanceledPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-white shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-800">
                Commande annulée
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-lg text-gray-700">
                  Votre commande a été annulée. Aucun paiement n'a été effectué.
                </p>
                
                <p className="text-gray-600">
                  Vos articles sont toujours dans votre panier si vous souhaitez finaliser votre achat.
                </p>
              </div>

              <div className="border-t pt-6">
                <div className="text-center space-y-4">
                  <p className="text-gray-600">
                    Une question ? Contactez-nous sur Instagram ou par email.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <Link href="/">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Retour à l'accueil
                      </Button>
                    </Link>
                    
                    <Link href="https://www.instagram.com/arode.studio/" target="_blank">
                      <Button className="flex items-center gap-2">
                        Instagram
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}