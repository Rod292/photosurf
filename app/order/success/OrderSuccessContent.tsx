'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Mail, Download, Home, AlertTriangle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useCartStore } from '@/context/cart-context';
import { getDisplayOrderNumber } from '@/lib/order-utils';

export function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('session_id');
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);
      setOrderNumber(getDisplayOrderNumber(sessionIdFromUrl));
      // Clear the cart after successful purchase
      clearCart();
    }
  }, [searchParams, clearCart]);

  const handleCopyOrderNumber = async () => {
    if (orderNumber) {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-green-200 bg-white/95 backdrop-blur-sm shadow-2xl shadow-green-100/50">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-green-500 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
            Commande confirmée ! 🎉
          </CardTitle>
          <p className="text-green-600 font-medium mt-2">Félicitations pour votre achat !</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-700">
              Merci pour votre achat ! Votre commande a été confirmée avec succès.
            </p>
            
            {orderNumber && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Numéro de commande :</p>
                <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg border-2 border-dashed border-green-300">
                  <span className="font-bold text-2xl text-green-800 tracking-wider">
                    {orderNumber}
                  </span>
                  <button
                    onClick={handleCopyOrderNumber}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copier le numéro de commande"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Conservez ce numéro pour toute question sur votre commande
                </p>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm">
              <div className="bg-blue-500 rounded-full p-2">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Email de confirmation</h3>
                <p className="text-sm text-blue-700">
                  Vous recevrez un email avec vos liens de téléchargement dans quelques minutes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 shadow-sm">
              <div className="bg-orange-500 rounded-full p-2">
                <AlertTriangle className="h-5 w-5 text-white flex-shrink-0" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">⚠️ Important : Vérifiez vos spams</h3>
                <p className="text-sm text-orange-700 mb-2">
                  L'email de téléchargement peut parfois arriver dans votre dossier spam ou courrier indésirable. 
                  <span className="font-medium"> Pensez à vérifier tous vos dossiers</span> si vous ne recevez pas l'email dans les 10 minutes.
                </p>
                <p className="text-xs text-orange-600 bg-orange-100 p-2 rounded-lg">
                  💡 Astuce : Ajoutez contact@arodestudio.com à vos contacts pour éviter ce problème à l'avenir.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 shadow-sm">
              <div className="bg-amber-500 rounded-full p-2">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Téléchargements</h3>
                <p className="text-sm text-amber-700">
                  Vos photos numériques en haute résolution seront disponibles pendant 7 jours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-sm">
              <div className="bg-purple-500 rounded-full p-2 text-white text-lg">
                🏄‍♂️
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 mb-1">Tirages photo</h3>
                <p className="text-sm text-purple-700">
                  Si vous avez commandé des tirages, vous recevrez un email séparé avec les instructions de récupération ou de livraison.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="text-center space-y-6">
              <p className="text-gray-600 text-lg">
                Une question ? Contactez-nous sur Instagram ou par email.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Home className="h-4 w-4" />
                    Retour à l'accueil
                  </Button>
                </Link>
                
                <Link href="https://www.instagram.com/arode.studio/" target="_blank">
                  <Button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md">
                    <span>📸</span>
                    Instagram
                  </Button>
                </Link>
              </div>
              
              <div className="text-sm text-gray-500 mt-4">
                <p>Merci de faire confiance à Arode Studio ! 🏄‍♂️</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}