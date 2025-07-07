import { Metadata } from "next"
import { Header } from "@/components/header"
import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"

export const metadata: Metadata = {
  title: "Mentions Légales - Arode Studio",
  description: "Mentions légales du site Arode Studio - Photographie de surf en Bretagne",
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-white">
        {/* Navigation */}
        <div className="bg-white py-4 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <Home className="w-4 h-4" />
              <span className="font-medium">Retour à l'accueil</span>
            </Link>
          </div>
        </div>

        {/* Contenu */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-playfair">
            Mentions Légales
          </h1>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Éditeur du Site</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p><strong>Nom de l'entreprise :</strong> Arode Studio</p>
                <p><strong>Adresse :</strong> La Torche, 29120 Plomeur, France</p>
                <p><strong>Adresse e-mail :</strong> <a href="mailto:contact@arodestudio.com" className="text-blue-600 hover:text-blue-800">contact@arodestudio.com</a></p>
                <p><strong>Numéro de SIRET :</strong> En cours d'obtention</p>
                <p><strong>Directeur de la publication :</strong> Arode Studio</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Hébergement</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p><strong>Hébergeur :</strong> Vercel Inc.</p>
                <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                <p><strong>Contact :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">vercel.com</a></p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Propriété Intellectuelle</h2>
              <p className="mb-4">
                L'intégralité du contenu présent sur le site <strong>www.arodestudio.com</strong>, incluant, de façon non limitative, les photographies, textes, logos, graphismes, et l'interface utilisateur, est la propriété exclusive de Arode Studio et est protégée par les législations française et internationale sur le droit d'auteur.
              </p>
              <p className="mb-4">
                Toute reproduction, distribution, ou utilisation de ce contenu, et notamment des photographies, sans l'autorisation écrite et préalable de Arode Studio, est strictement interdite et constitue une contrefaçon sanctionnée par les articles L. 335-2 et suivants du Code de la propriété intellectuelle.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Conditions d'Utilisation des Photographies</h2>
              <p className="mb-4">
                Ce site a pour vocation la consultation et la vente de photographies. Les droits d'utilisation diffèrent selon que les photographies sont simplement consultées sur le site ou qu'elles ont fait l'objet d'un achat.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Photographies affichées sur le site</h3>
              <p className="mb-4">
                Les photographies présentées dans les galeries sont en basse résolution et marquées d'un filigrane. Elles sont destinées à la seule consultation. Il est formellement interdit de les télécharger, de les capturer par copie d'écran, de les modifier ou de les utiliser à quelque fin que ce soit sans achat préalable d'une licence.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Photographies achetées</h3>
              
              <h4 className="text-lg font-medium text-gray-700 mb-2">Achat d'un fichier numérique (JPEG)</h4>
              <p className="mb-4">
                L'achat d'une photographie au format numérique confère à l'acheteur une licence d'utilisation à des fins strictement personnelles et non commerciales. Cette licence inclut le droit d'imprimer la photo pour un usage privé et de la partager sur des réseaux sociaux personnels, à condition de ne pas en faire un usage commercial ou publicitaire. La revente, la modification à des fins de revente, ou la cession des droits à un tiers sont interdites.
              </p>

              <h4 className="text-lg font-medium text-gray-700 mb-2">Achat d'un tirage physique (Impression)</h4>
              <p className="mb-4">
                L'achat d'un tirage photo confère la propriété de l'objet physique, mais ne transfère aucun droit de reproduction. Il est interdit de scanner, copier ou reproduire le tirage acheté à des fins de distribution, qu'elle soit commerciale ou non.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Protection des Données Personnelles</h2>
              <p className="mb-4">
                Arode Studio s'engage à ce que la collecte et le traitement de vos données personnelles (adresse e-mail lors d'une commande, données de facturation) soient conformes au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
              </p>
              <p className="mb-4">
                Les données collectées sont utilisées uniquement pour le traitement de vos commandes et la livraison de vos achats. Elles ne sont jamais partagées avec des tiers à des fins commerciales.
              </p>
              <p className="mb-4">
                Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles. Pour toute information ou exercice de vos droits, vous pouvez nous contacter à <a href="mailto:contact@arodestudio.com" className="text-blue-600 hover:text-blue-800">contact@arodestudio.com</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Utilisation de Cookies</h2>
              <p className="mb-4">
                Ce site utilise des cookies techniques nécessaires au fonctionnement du panier d'achat et de l'authentification administrative. Nous utilisons également des cookies d'analyse (Vercel Analytics) pour améliorer l'expérience utilisateur.
              </p>
              <p className="mb-4">
                Aucune donnée personnelle n'est collectée via ces cookies d'analyse, et vous pouvez les désactiver dans les paramètres de votre navigateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation de Responsabilité</h2>
              <p className="mb-4">
                Arode Studio met tout en œuvre pour offrir aux utilisateurs des informations et/ou des outils disponibles et vérifiés, mais ne saurait être tenu pour responsable des erreurs, d'une absence de disponibilité des informations et/ou de la présence de virus sur son site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Droit Applicable</h2>
              <p className="mb-4">
                Le présent site est soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Pour toute question concernant ces mentions légales, contactez-nous à <a href="mailto:contact@arodestudio.com" className="text-blue-600 hover:text-blue-800">contact@arodestudio.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}