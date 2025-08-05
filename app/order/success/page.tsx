import { Suspense } from 'react';
import { OrderSuccessContent } from './OrderSuccessContent';

export const metadata = {
  title: 'Commande confirmée - Arode Studio',
  description: 'Votre commande a été confirmée avec succès',
};

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8 sm:py-16">
        <Suspense fallback={
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        }>
          <OrderSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}