import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/login/actions";

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect: redirectTo, message } = await searchParams
  
  console.log('[Login Page] Redirect parameter:', redirectTo)
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            Connexion Admin
          </CardTitle>
          <CardDescription>
            Entrez le mot de passe pour accéder à l'interface d'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{message}</p>
            </div>
          )}
          
          <form action={login} className="space-y-4">
            {redirectTo && (
              <input type="hidden" name="redirect" value={redirectTo} />
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" placeholder="Entrez le mot de passe" required />
            </div>
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 