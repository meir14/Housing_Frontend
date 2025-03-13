export interface Listing {
  id: string
  user_id: string
  listing_title: string
  property_type: string
  rent_monthly: number
  deposit_amount: number | null
  location: string
  available_date: string
  minimum_stay: string | null
  bills_included: boolean
  num_bedrooms: number
  num_bathrooms: number
  current_occupants: number | null
  occupant_preferences: string | null
  amenities: string[]
  furnished: boolean
  smoking_policy: string | null
  pet_policy: string | null
  property_photos: string[]
  room_size: string | null
  description: string | null
  contact_method: string | null
  listing_creation_date: string
  last_updated: string
}

export interface FilterOptions {
  location: string
  minPrice: number
  maxPrice: number
  propertyType: string
  furnished: boolean | null
  numBedrooms: number | null
  petsAllowed: boolean | null
  billsIncluded: boolean | null
}

