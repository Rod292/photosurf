import { redirect } from 'next/navigation'

// Redirect old La Torche specific URL to new location-based URL
export default function LaTorchePage() {
  redirect('/location/la-torche')
}