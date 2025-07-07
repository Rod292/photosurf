'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Mail, Download, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('session_id');
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);
      // Clear the cart after successful purchase
      clearCart();
    }
  }, [searchParams, clearCart]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-green-200 bg-white shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Commande confirmée ! 🎉
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-700">
              Merci pour votre achat ! Votre commande a été confirmée avec succès.
            </p>
            
            {sessionId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Numéro de commande :</p>
                <p className="font-mono text-sm bg-white p-2 rounded border">
                  {sessionId}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Email de confirmation</h3>
                <p className="text-sm text-blue-700">
                  Vous recevrez un email avec vos liens de téléchargement dans quelques minutes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-orange-900">⚠️ Important : Vérifiez vos spams</h3>
                <p className="text-sm text-orange-700">
                  L'email de téléchargement peut parfois arriver dans votre dossier spam ou courrier indésirable. 
                  <span className="font-medium"> Pensez à vérifier tous vos dossiers</span> si vous ne recevez pas l'email dans les 10 minutes.
                </p>
                <p className="text-xs text-orange-600 mt-2">
                  💡 Astuce : Ajoutez contact@arodestudio.com à vos contacts pour éviter ce problème à l'avenir.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
              <Download className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-900">Téléchargements</h3>
                <p className="text-sm text-amber-700">
                  Vos photos en haute résolution seront disponibles pendant 48 heures.
                </p>
              </div>
            </div>
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
  );
}