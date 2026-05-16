export interface Property {
  id: string
  name: string
  address: string | null
  city: string
  state: string
  contact_name: string | null
  contact_email: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}
