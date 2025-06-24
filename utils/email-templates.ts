export const customerEmailTemplate = (customerName: string, totalPrice: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de commande - Arode Studio</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      width: 120px;
      margin-bottom: 20px;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666666;
      font-size: 14px;
    }
    .social-link {
      color: #1a1a1a;
      text-decoration: none;
    }
  </style>
</head>
<body style="background-color: #f5f5f5;">
  <div class="container">
    <div class="header">
      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/arodelogowhitepng-HNnXW50qCnMuNb7pxKVPk3x4zxq9mP.png" 
           alt="Arode Studio" 
           class="logo"
           style="filter: brightness(0);">
      <h1 style="color: #1a1a1a; margin: 0;">Merci pour votre commande !</h1>
    </div>
    
    <div class="content">
      <p>Bonjour ${customerName},</p>
      
      <p>Nous avons bien reçu votre commande ${totalPrice > 0 ? `d'un montant de ${totalPrice.toFixed(2)}€` : "gratuite"}.</p>
      
      <p>Vos photos vous seront envoyées par mail dans un délai de quelques heures.</p>
      
      <p>Vous recevrez vos photos en haute résolution et avec les retouches finales.</p>
      
      <p>Si vous avez des questions, n'hésitez pas à nous contacter sur Instagram.</p>
      
      <p style="margin-top: 30px;">À bientôt,<br>L'équipe Arode Studio</p>
    </div>
    
    <div class="footer">
      <p>
        Suivez-nous sur 
        <a href="https://www.instagram.com/arode.studio/" class="social-link" target="_blank">Instagram</a>
      </p>
      <p>&copy; ${new Date().getFullYear()} Arode Studio. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
`

export const adminEmailTemplate = (orderDetails: {
  customerEmail: string
  customerName: string
  billingAddress: {
    line1: string
    line2?: string
    city: string
    postal_code: string
    country: string
  }
  items: Array<{
    id: string
    title: string
    price: number
    surfer?: string
    fileName: string
  }>
  totalPrice: number
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle commande - Arode Studio</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      margin-bottom: 30px;
    }
    .content {
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .order-details {
      margin-top: 20px;
      border-top: 1px solid #eeeeee;
      padding-top: 20px;
    }
    .photo-item {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eeeeee;
    }
    .photo-item:last-child {
      border-bottom: none;
    }
    .total {
      margin-top: 20px;
      font-weight: bold;
    }
    .customer-info {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body style="background-color: #f5f5f5;">
  <div class="container">
    <div class="header">
      <h1 style="color: #1a1a1a; margin: 0;">Nouvelle commande reçue !</h1>
    </div>
    
    <div class="content">
      <div class="customer-info">
        <h2 style="margin-top: 0;">Informations client</h2>
        <p><strong>Nom :</strong> ${orderDetails.customerName}</p>
        <p><strong>Email :</strong> ${orderDetails.customerEmail}</p>
        <p><strong>Adresse de facturation :</strong><br>
          ${orderDetails.billingAddress.line1}<br>
          ${orderDetails.billingAddress.line2 ? `${orderDetails.billingAddress.line2}<br>` : ""}
          ${orderDetails.billingAddress.postal_code} ${orderDetails.billingAddress.city}<br>
          ${orderDetails.billingAddress.country}
        </p>
      </div>
      
      <div class="order-details">
        <h2>Détails de la commande</h2>
        <p><strong>Nombre de photos :</strong> ${orderDetails.items.length}</p>
        
        ${orderDetails.items
          .map(
            (item) => `
          <div class="photo-item">
            <p>
              <strong>${item.title}</strong><br>
              Prix : ${item.price === 0 ? "Gratuit" : `${item.price.toFixed(2)}€`}<br>
              ${item.surfer ? `Surfeur : ${item.surfer}<br>` : ""}
              ID : ${item.id}<br>
              Nom du fichier : ${item.fileName}
            </p>
          </div>
        `,
          )
          .join("")}
        
        <div class="total">
          <p>Prix total : ${orderDetails.totalPrice.toFixed(2)}€</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`

