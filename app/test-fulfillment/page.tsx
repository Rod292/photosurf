'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle, AlertCircle } from 'lucide-react';

export default function TestFulfillmentPage() {
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('test-order-' + Math.random().toString(36).substr(2, 9));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success?: boolean, message?: string, error?: string} | null>(null);

  const handleSendTest = async () => {
    if (!email) {
      setResult({ error: 'Veuillez entrer un email' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-fulfillment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ error: data.error || 'Erreur inconnue' });
      }
    } catch (error) {
      setResult({ error: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendSimpleTest = async () => {
    if (!email) {
      setResult({ error: 'Veuillez entrer un email' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-simple-fulfillment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ error: data.error || 'Erreur inconnue' });
      }
    } catch (error) {
      setResult({ error: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Test Order Fulfillment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email du client
              </label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>


            <div className="space-y-2">
              <Button 
                onClick={handleSendSimpleTest} 
                disabled={loading}
                className="w-full"
                variant="default"
              >
                {loading ? 'Envoi...' : 'Test simple (SANS liens)'}
              </Button>
              
              <Button 
                onClick={handleSendTest} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? 'Envoi...' : 'Test complet (liens Supabase)'}
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg flex items-center gap-2 ${
                result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {result.success ? result.message : result.error}
                </span>
              </div>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Test simple :</strong> Email de confirmation sans liens</p>
              <p><strong>Test complet :</strong> Email avec vrais liens Supabase (mais factices)</p>
              <p>• Utilisez l'email: arodestudio@gmail.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}