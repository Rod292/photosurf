import { Suspense } from 'react';
import { OrderSuccessContent } from './OrderSuccessContent';

export const metadata = {
  title: 'Commande confirmée - Arode Studio',
  description: 'Votre commande a été confirmée avec succès',
};

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <Suspense fallback={<div className="text-center">Chargement...</div>}>
          <OrderSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}