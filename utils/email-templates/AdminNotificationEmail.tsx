import type * as React from "react"
import { Html, Body, Head, Heading, Container, Preview, Section, Text } from "@react-email/components"

interface AdminNotificationEmailProps {
  customerEmail: string
  customerName: string
  totalPrice: number
  orderItems: string[]
}

export const AdminNotificationEmail: React.FC<AdminNotificationEmailProps> = ({
  customerEmail,
  customerName,
  totalPrice,
  orderItems,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Nouvelle commande Arode Studio</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Nouvelle commande reçue !</Heading>

          <Section style={section}>
            <Heading as="h2" style={h2}>
              Informations client
            </Heading>
            <Text style={text}>Nom : {customerName}</Text>
            <Text style={text}>Email : {customerEmail}</Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={h2}>
              Détails de la commande
            </Heading>
            <Text style={text}>Prix total : {totalPrice.toFixed(2)}€</Text>

            <Text style={photoSectionTitle}>Photos achetées :</Text>
            {orderItems && orderItems.length > 0 ? (
              <div style={photoList}>
                {orderItems.map((item, index) => {
                  const [path, price, surfer] = item.split("|")
                  return (
                    <div key={index} style={photoItem}>
                      <Text style={photoPath}>{path}</Text>
                      <div style={photoDetails}>
                        <Text style={detailText}>Prix : {Number.parseFloat(price || "0").toFixed(2)}€</Text>
                        <Text style={detailText}>Surfeur : {surfer || "Non spécifié"}</Text>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <Text style={noPhotosText}>Aucune photo dans la commande</Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
  borderRadius: "8px",
}

const section = {
  padding: "0 48px",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
}

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "20px 0",
}

const text = {
  color: "#333",
  fontSize: "16px",
  margin: "12px 0",
  lineHeight: "24px",
}

const photoSectionTitle = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "24px 0 16px",
}

const photoList = {
  borderTop: "1px solid #eee",
  marginTop: "16px",
  paddingTop: "16px",
}

const photoItem = {
  backgroundColor: "#f8f9fa",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "12px",
  border: "1px solid #eee",
}

const photoPath = {
  color: "#1a1a1a",
  fontSize: "14px",
  fontFamily: "monospace",
  backgroundColor: "#f1f1f1",
  padding: "8px",
  borderRadius: "4px",
  marginBottom: "8px",
  wordBreak: "break-all" as const,
}

const photoDetails = {
  marginLeft: "8px",
}

const detailText = {
  color: "#666",
  fontSize: "14px",
  margin: "4px 0",
}

const noPhotosText = {
  color: "#666",
  fontStyle: "italic",
  margin: "16px 0",
}

export default AdminNotificationEmail

