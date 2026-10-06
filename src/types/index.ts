export type EmergencyCategory =
  | 'accident'
  | 'breathing'
  | 'chest_discomfort'
  | 'injury'
  | 'sudden_illness'
  | 'fire'
  | 'other';

export type EmergencyStatus =
  | 'received'
  | 'assigned'
  | 'en_route'
  | 'arrived'
  | 'resolved'
  | 'cancelled';

export interface LocationData {
  address: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface EmergencyRequest {
  id: string;
  timestamp: string;
  category: EmergencyCategory;
  categoryLabel: string;
  status: EmergencyStatus;
  patientName: string;
  contactNumber: string;
  location: LocationData;
  hospitalName?: string;
  ambulanceUnitCode?: string;
  etaMinutes?: number;
  notes?: string;
  severity: 'Critical' | 'Severe' | 'Urgent';
}

export interface Hospital {
  id: string;
  name: string;
  distanceKm: number;
  driveTimeMin?: number;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  emergencyDirectLine?: string;
  rating?: number;
  reviewCount?: number;
  isOpen24x7?: boolean;
  openNow?: boolean;
  openStatusText?: string;
  hasEmergencyDepartment?: boolean;
  traumaLevel?: 'Level 1 Trauma' | 'Level 2 Trauma' | 'Comprehensive Emergency' | 'General Emergency' | string;
  type?: string;
  erWaitTimeMinutes?: number;
  icuBedsAvailable?: number;
  totalBeds?: number;
  services?: string[];
  imageUrl?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  openingHoursDescriptions?: string[];
  photos?: string[];
  placeId?: string;
  isRealPlace?: boolean;
  calculatedDurationText?: string;
  calculatedDistanceText?: string;
}

export interface AmbulanceUnit {
  id: string;
  unitCode: string;
  type: 'Advanced Life Support (ALS)' | 'Basic Life Support (BLS)' | 'Critical Care Transport' | 'Neonatal / Pediatric';
  driverName: string;
  paramedicLead: string;
  status: 'Available' | 'Dispatched' | 'En Route' | 'On Scene' | 'Standby';
  phone: string;
  baseHospital: string;
  plateNumber: string;
  currentEtaMinutes: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: 'Parent' | 'Spouse' | 'Family Member' | 'Primary Doctor' | 'Guardian' | 'Trusted Contact';
  phone: string;
  alternatePhone?: string;
  isPrimary: boolean;
  email?: string;
}

export interface MedicalProfile {
  id: string;
  fullName: string;
  age: number;
  dateOfBirth: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  existingConditions: string[];
  currentMedications: string[];
  emergencyNotes: string;
  primaryDoctor: {
    name: string;
    hospital: string;
    phone: string;
  };
  organDonor: boolean;
  insuranceProvider: string;
  policyNumber: string;
  weightKg?: number;
  heightCm?: number;
}

export interface FirstAidTopic {
  id: string;
  title: string;
  category: 'Cuts & Bleeding' | 'Burns' | 'Fainting' | 'Choking' | 'Sprains & Fractures' | 'Heat Illness' | 'CPR Basics';
  icon: string;
  summary: string;
  steps: string[];
  whatNotToDo: string[];
  whenToSeekHelp: string[];
  severityLevel: 'Mild' | 'Moderate' | 'Critical';
}

export interface EmergencyServiceItem {
  id: string;
  name: string;
  category: 'Ambulance' | 'Hospital ER' | 'Poison Control' | 'Blood Bank' | 'Pharmacy' | 'Urgent Clinic';
  icon: string;
  phone: string;
  hours: string;
  address: string;
  description: string;
  badge?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'emergency' | 'ambulance' | 'contact' | 'profile' | 'system';
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
