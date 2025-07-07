import type * as React from "react"
import { Html, Body, Head, Heading, Hr, Container, Preview, Section, Text, Link, Img, Button } from "@react-email/components"
import { proxySupabaseUrl, localizeImageUrl } from "../../lib/email-utils"

interface PhotoDownload {
  photoId: string
  downloadUrl: string
  thumbnailUrl?: string
  expiresAt: string
}

interface OrderConfirmationWithDownloadsEmailProps {
  customerName: string
  totalPrice: number
  downloads: PhotoDownload[]
}

export const OrderConfirmationWithDownloadsEmail: React.FC<OrderConfirmationWithDownloadsEmailProps> = ({
  customerName,
  totalPrice,
  downloads,
}) => (
  <Html>
    <Head />
    <Preview>Vos photos Arode Studio sont prêtes au téléchargement</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://www.arodestudio.com/images/arode-logo-white.png"
            width="120"
            height="120"
            alt="Arode Studio"
            style={logo}
          />
        </Section>
        <Section style={contentSection}>
          <Heading style={h1}>Vos photos sont prêtes ! 📸</Heading>
          <Text style={text}>Bonjour {customerName},</Text>
          <Text style={text}>
            Merci pour votre commande{totalPrice > 0 ? ` d'un montant de ${totalPrice.toFixed(2)}€` : ""}. 
            Vos photos en haute résolution sont maintenant disponibles au téléchargement !
          </Text>
          
          <Section style={downloadSection}>
            <Heading style={h2}>Vos photos ({downloads.length})</Heading>
            <Text style={warningText}>
              ⚠️ Important: Ces liens de téléchargement expireront dans 48 heures. 
              Assurez-vous de télécharger vos photos avant l'expiration.
            </Text>
            
            {downloads.map((download, index) => (
              <div key={download.photoId} style={photoCard}>
                {download.thumbnailUrl && (
                  <Img
                    src={proxySupabaseUrl(download.thumbnailUrl)}
                    alt={`Photo ${index + 1}`}
                    style={thumbnail}
                  />
                )}
                <div style={downloadInfo}>
                  <Text style={photoName}>Photo {index + 1}</Text>
                  <Link href={proxySupabaseUrl(download.downloadUrl)} style={downloadButton}>
                    Télécharger
                  </Link>
                  <Text style={expiryText}>
                    Expire le: {new Date(download.expiresAt).toLocaleDateString('fr-FR')}
                  </Text>
                </div>
              </div>
            ))}
            
            <div style={downloadAllContainer}>
              <Text style={tipText}>
                💡 Astuce: Pour télécharger toutes vos photos en une fois, 
                faites un clic droit sur chaque bouton "Télécharger" et 
                sélectionnez "Enregistrer le lien sous..."
              </Text>
            </div>
          </Section>

          <Hr style={hr} />
          
          <Text style={text}>
            Si vous avez des questions ou des problèmes avec vos téléchargements, 
            n'hésitez pas à nous contacter en répondant directement à cet email.
          </Text>
          
          <Text style={footer}>
            À bientôt,
            <br />
            L'équipe Arode Studio
          </Text>
          
          <Section style={socialSection}>
            <Link href="https://www.instagram.com/arode.studio/" target="_blank" style={instagramButton}>
              SUIVEZ-NOUS SUR INSTAGRAM
            </Link>
          </Section>

          <Section style={printSection}>
            <Heading style={printHeading}>TIRAGES PHOTO</Heading>
            <div style={imageContainer}>
              <Img
                src="https://www.arodestudio.com/images/print-mockup.png"
                width="500"
                height="375"
                alt="Exemple de tirage photo encadré"
                style={printImage}
              />
            </div>
            <Text style={printText}>
              Vous souhaitez imprimer vos photos ? Nous proposons des tirages professionnels 
              sur papier photo haute qualité.
            </Text>
            <Text style={featureText}>• Formats disponibles jusqu'à A2 📄✅</Text>
            <Text style={featureText}>• Papier photo haute qualité 📸✨</Text>
            <Text style={featureText}>• Rendu des couleurs exceptionnel 🎨🔥</Text>
            <div style={buttonContainer}>
              <Link href="https://www.instagram.com/arode.studio/" target="_blank" style={contactButton}>
                📸 Contactez nous pour vos tirages
              </Link>
            </div>
          </Section>
        </Section>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "48px 0",
  marginBottom: "64px",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "600px",
}

const logoSection = {
  textAlign: "center" as const,
  padding: "0 48px",
  marginBottom: "32px",
  paddingTop: "16px",
  paddingBottom: "16px",
}

const logo = {
  margin: "0 auto",
  display: "block",
  width: "120px",
  height: "120px",
  objectFit: "contain" as const,
}

const contentSection = {
  padding: "0 48px",
}

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
}

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "24px 0 16px 0",
  padding: "0",
}

const text = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "24px 0",
}

const warningText = {
  backgroundColor: "#fef3c7",
  border: "1px solid #f59e0b",
  borderRadius: "8px",
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "16px 0 24px 0",
  padding: "12px 16px",
}

const downloadSection = {
  backgroundColor: "#f8f9fa",
  borderRadius: "12px",
  margin: "32px 0",
  padding: "24px",
}

const photoCard = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  marginBottom: "16px",
  padding: "16px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
}

const thumbnail = {
  width: "80px",
  height: "80px",
  objectFit: "cover" as const,
  borderRadius: "4px",
}

const downloadInfo = {
  flex: 1,
}

const photoName = {
  color: "#1a1a1a",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0 0 12px 0",
}

const downloadButton = {
  backgroundColor: "#10b981",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "500",
  padding: "10px 20px",
  textDecoration: "none",
  margin: "0 0 16px 0",
}

const expiryText = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "0",
}

const downloadAllContainer = {
  marginTop: "24px",
  paddingTop: "16px",
  borderTop: "1px solid #e5e7eb",
}

const tipText = {
  backgroundColor: "#eff6ff",
  border: "1px solid #3b82f6",
  borderRadius: "8px",
  color: "#1e3a8a",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
  padding: "12px 16px",
}

const socialSection = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "48px",
}

const instagramButton = {
  backgroundColor: "#1a1a1a",
  borderRadius: "24px",
  color: "#fff",
  display: "inline-block",
  fontSize: "13px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
}

const hr = {
  borderColor: "#e2e8f0",
  margin: "32px 0",
}

const footer = {
  color: "#4a5568",
  fontSize: "14px",
  lineHeight: "24px",
  textAlign: "center" as const,
}

const printSection = {
  backgroundColor: "#f8f9fa",
  padding: "32px",
  borderRadius: "12px",
  marginTop: "48px",
}

const imageContainer = {
  margin: "24px 0",
  textAlign: "center" as const,
}

const printImage = {
  maxWidth: "100%",
  height: "auto",
  borderRadius: "8px",
}

const printHeading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1a1a1a",
  textAlign: "center" as const,
  marginBottom: "24px",
  marginTop: "0",
}

const printText = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "16px 0",
}

const featureText = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "4px 0",
}

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "24px",
}

const contactButton = {
  display: "inline-block",
  backgroundColor: "#1a1a1a",
  color: "#ffffff",
  padding: "12px 20px",
  borderRadius: "24px",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "500",
  minWidth: "200px",
  textAlign: "center" as const,
}