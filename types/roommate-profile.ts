export interface RoommateProfile {
  // Academic Information
  study_level: string;
  field_of_study: string;
  estimated_graduation_year: number;
  
  // Personal Information
  full_name: string;
  age: number;
  gender_pronouns: string;
  profile_photo: string;
  
  // Contact & Location
  phone_number: string;
  preferred_locations: string;
  budget_range: string;
  
  // Preferences & Lifestyle
  smoking_pref: string;
  pets_pref: string;
  social_habits: string;
  
  // About & Interests
  about_me: string;
  interests_hobbies: string;
  roommate_preferences: string;
}

