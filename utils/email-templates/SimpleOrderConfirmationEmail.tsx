import type * as React from "react"
import { Html, Body, Head, Heading, Hr, Container, Preview, Section, Text, Link, Img } from "@react-email/components"

interface SimpleOrderConfirmationEmailProps {
  customerName: string
  totalPrice: number
  orderItems: string[]
}

export const SimpleOrderConfirmationEmail: React.FC<SimpleOrderConfirmationEmailProps> = ({
  customerName,
  totalPrice,
  orderItems,
}) => (
  <Html>
    <Head />
    <Preview>Votre commande Arode Studio est confirmée</Preview>
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
          <Heading style={h1}>Commande confirmée ! 🎉</Heading>
          <Text style={text}>Bonjour {customerName},</Text>
          <Text style={text}>
            Merci pour votre commande{totalPrice > 0 ? ` d'un montant de ${totalPrice.toFixed(2)}€` : ""}.
          </Text>
          
          <Section style={orderSection}>
            <Heading style={h2}>Votre commande ({orderItems.length} photo{orderItems.length > 1 ? 's' : ''})</Heading>
            {orderItems.map((item, index) => (
              <Text key={index} style={itemText}>
                • {item}
              </Text>
            ))}
          </Section>

          <Text style={text}>
            <strong>✉️ Prochaines étapes :</strong>
          </Text>
          <Text style={text}>
            Vos photos en haute résolution vous seront envoyées par email dans les prochaines heures. 
            Vous recevrez un second email avec vos liens de téléchargement sécurisés.
          </Text>
          
          <Text style={text}>
            Si vous avez des questions, n'hésitez pas à nous contacter en répondant directement à cet email.
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
  fontSize: "18px",
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

const orderSection = {
  backgroundColor: "#f8f9fa",
  borderRadius: "12px",
  margin: "32px 0",
  padding: "24px",
}

const itemText = {
  color: "#4a5568",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "8px 0",
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