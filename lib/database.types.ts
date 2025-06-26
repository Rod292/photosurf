export interface SurfSchool {
  id: number
  name: string
  slug: string
  is_active?: boolean
  created_at?: string
}

export interface Gallery {
  id: string  // UUID
  name: string
  slug?: string
  date: string
  school_id?: number  // Foreign key vers surf_schools
  created_at?: string
  surf_school?: {
    id: number
    name: string
    slug: string
  }
}

export interface Photo {
  id: string  // UUID
  gallery_id: string  // UUID
  original_s3_key: string
  preview_s3_url: string
  filename: string
  filesize?: number
  content_type?: string
  created_at?: string
  gallery?: Gallery
}

export interface Order {
  id: string  // UUID
  customer_email: string
  stripe_checkout_id?: string
  status: 'pending' | 'completed' | 'cancelled'
  total_amount?: number
  created_at?: string
}

export interface OrderItem {
  id: string  // UUID
  order_id: string  // UUID
  photo_id: string  // UUID
  product_type: 'digital' | 'print'
  price: number
  created_at?: string
}

// Types pour les formulaires
export interface UploadFormData {
  school_id: number
  gallery_id?: string  // UUID
  new_gallery_name?: string
  gallery_date: string
  original_files: File[]
  preview_files: File[]
}

export interface FileMatch {
  original: File | null
  preview: File | null
  matched: boolean
}
