/**
 * Convertit une URL Supabase en URL proxy de notre domaine pour améliorer la délivrabilité email
 */
export function proxySupabaseUrl(originalUrl: string): string {
  try {
    const url = new URL(originalUrl)
    
    // Vérifier si c'est une URL Supabase Storage
    if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/')) {
      // Extraire le bucket et le path
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.indexOf('object')
      
      if (bucketIndex !== -1) {
        const bucket = pathParts[bucketIndex + 2] // après 'object/public/' ou 'object/sign/'
        const path = pathParts.slice(bucketIndex + 3).join('/')
        
        // Retourner l'URL proxy
        return `https://www.arodestudio.com/api/proxy-image?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`
      }
    }
    
    // Si ce n'est pas une URL Supabase, retourner l'original
    return originalUrl
  } catch (error) {
    console.error('Error processing URL:', error)
    return originalUrl
  }
}

/**
 * Convertit une URL Vercel Blob en URL locale si possible
 */
export function localizeImageUrl(imageUrl: string): string {
  // Pour les images du logo, on peut les héberger localement
  if (imageUrl.includes('vercel-storage.com')) {
    // Retourner l'URL locale si elle existe
    const filename = imageUrl.split('/').pop()
    if (filename?.includes('arodelogo')) {
      return 'https://www.arodestudio.com/images/logo.png'
    }
  }
  
  return imageUrl
}

/**
 * Génère une version plain text d'un email HTML
 */
export function generatePlainTextEmail(orderData: {
  customerEmail: string
  orderItems: Array<{
    photo: { filename: string }
    product_type: string
    price: number
  }>
  downloadLinks: Array<{
    filename: string
    downloadUrl: string
  }>
}): string {
  const { customerEmail, orderItems, downloadLinks } = orderData
  
  let plainText = `Bonjour,\n\n`
  plainText += `Merci pour votre commande sur Arode Studio !\n\n`
  plainText += `Récapitulatif de votre commande :\n`
  plainText += `Email : ${customerEmail}\n\n`
  
  plainText += `Photos commandées :\n`
  orderItems.forEach((item, index) => {
    plainText += `${index + 1}. ${item.photo.filename} - ${item.product_type} - ${item.price}€\n`
  })
  
  if (downloadLinks.length > 0) {
    plainText += `\nVos liens de téléchargement (valides 7 jours) :\n`
    downloadLinks.forEach((link, index) => {
      plainText += `${index + 1}. ${link.filename}: ${link.downloadUrl}\n`
    })
  }
  
  plainText += `\nPour toute question, n'hésitez pas à nous contacter à contact@arodestudio.com\n\n`
  plainText += `Merci de votre confiance,\n`
  plainText += `L'équipe Arode Studio\n`
  plainText += `La Torche, Bretagne\n`
  plainText += `https://www.arodestudio.com`
  
  return plainText
}