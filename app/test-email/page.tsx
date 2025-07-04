'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success?: boolean, message?: string, error?: string} | null>(null);

  const handleSendTest = async () => {
    if (!email) {
      setResult({ error: 'Veuillez entrer une adresse email' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
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
              <Mail className="h-5 w-5" />
              Test Email Resend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Votre adresse email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleSendTest} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Envoi...' : 'Envoyer email test'}
            </Button>

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
              <p>• Cet email sera envoyé depuis onboarding@resend.dev</p>
              <p>• Vérifiez vos spams si vous ne recevez rien</p>
              <p>• L'email contiendra des liens de test (non fonctionnels)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}