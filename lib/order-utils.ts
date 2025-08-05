/**
 * Utility functions for order processing
 */

/**
 * Generate a short, user-friendly order number from a Stripe session ID
 * Converts long Stripe session IDs to 8-character alphanumeric codes
 */
export function generateShortOrderNumber(stripeSessionId: string): string {
  // Remove common Stripe prefixes
  const cleanId = stripeSessionId.replace(/^(cs_live_|cs_test_|free_)/, '')
  
  // Create a hash-like short code
  let hash = 0
  for (let i = 0; i < cleanId.length; i++) {
    const char = cleanId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert to positive number and encode as base36 (0-9, a-z)
  const shortCode = Math.abs(hash).toString(36).toUpperCase()
  
  // Ensure it's exactly 8 characters, pad with zeros or truncate
  const paddedCode = shortCode.padStart(8, '0').slice(0, 8)
  
  // Format as XXXX-XXXX for better readability
  return `${paddedCode.slice(0, 4)}-${paddedCode.slice(4)}`
}

/**
 * Get display-friendly order number for UI
 * Converts both long Stripe IDs and short codes to consistent format
 */
export function getDisplayOrderNumber(identifier: string): string {
  // If it's already a short code format, return as-is
  if (/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(identifier)) {
    return identifier
  }
  
  // If it's a Stripe session ID, convert to short format
  if (identifier.startsWith('cs_') || identifier.startsWith('free_')) {
    return generateShortOrderNumber(identifier)
  }
  
  // For any other format, try to create a short version
  return generateShortOrderNumber(identifier)
}