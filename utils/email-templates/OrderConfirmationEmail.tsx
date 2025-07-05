import type * as React from "react"
import { Html, Body, Head, Heading, Hr, Container, Preview, Section, Text, Link, Img } from "@react-email/components"

interface OrderConfirmationEmailProps {
  customerName: string
  totalPrice: number
  photoIds: string[]
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  customerName,
  totalPrice,
  photoIds,
}) => (
  <Html>
    <Head />
    <Preview>Votre commande Arode Studio est confirmée</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogo2-3rLHVrTg3M1BwmO55e2Bd3rfphyoKU.png"
            width="80"
            height="80"
            alt="Arode Studio"
            style={{
              ...logo,
              filter: "brightness(0)", // Makes the white logo black for light backgrounds
            }}
          />
        </Section>
        <Section style={contentSection}>
          <Heading style={h1}>Merci pour ta commande !</Heading>
          <Text style={text}>Hello {customerName},</Text>
          <Text style={text}>
            Nous avons bien reçu ta commande{totalPrice > 0 ? ` d'un montant de ${totalPrice.toFixed(2)}€` : ""}.
          </Text>
          <Text style={text}>
            Tes photos te seront envoyées par mail dans un délai de quelques heures. Tu recevras tes photos en haute
            résolution et avec les retouches finales.
          </Text>
          <Text style={text}>
            Si tu as des questions, n'hésite pas à nous contacter en répondant directement à cet email ou sur Instagram.
          </Text>
          <Hr style={hr} />
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
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Beige%20Minimalist%20Picture%20Frame%20Mockup%20Instagram%20Post-1qtGHkoHXu1DX4vj6NlRbO5b1nORxP.png"
                width="500"
                height="375"
                alt="Exemple de tirage photo encadré"
                style={printImage}
              />
            </div>
            <Text style={printText}>
              Nous pouvons imprimer vos photos avec notre imprimante professionnelle EPSON sur du papier photo de haute
              qualité.
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
}

const logo = {
  margin: "0 auto",
  display: "block",
  width: "80px",
  height: "80px",
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

const text = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "24px 0",
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

const printFeatures = {
  margin: "24px 0",
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

