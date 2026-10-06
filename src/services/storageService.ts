import {
  Hospital,
  AmbulanceUnit,
  EmergencyContact,
  MedicalProfile,
  EmergencyRequest,
  AppNotification,
  LocationData,
} from '../types';

import {
  INITIAL_HOSPITALS,
  INITIAL_AMBULANCES,
  INITIAL_CONTACTS,
  INITIAL_MEDICAL_PROFILE,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAST_REQUESTS,
  INITIAL_USER_LOCATION,
} from './mockData';

const STORAGE_KEYS = {
  HOSPITALS: 'medassist_hospitals',
  AMBULANCES: 'medassist_ambulances',
  CONTACTS: 'medassist_contacts',
  MEDICAL_PROFILE: 'medassist_medical_profile',
  REQUESTS: 'medassist_requests',
  NOTIFICATIONS: 'medassist_notifications',
  ACTIVE_EMERGENCY: 'medassist_active_emergency',
  SAVED_HOSPITALS: 'medassist_saved_hospitals',
  USER_LOCATION: 'medassist_user_location',
};

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const StorageService = {
  getHospitals: (): Hospital[] => {
    const list = getStoredItem<Hospital[]>(STORAGE_KEYS.HOSPITALS, []);
    return list.filter(h => h && h.isRealPlace && !h.name.includes('St. Jude') && h.id !== 'hosp-1');
  },
  saveHospitals: (hospitals: Hospital[]) => {
    setStoredItem(STORAGE_KEYS.HOSPITALS, hospitals);
  },

  getAmbulances: (): AmbulanceUnit[] => {
    return getStoredItem<AmbulanceUnit[]>(STORAGE_KEYS.AMBULANCES, INITIAL_AMBULANCES);
  },
  saveAmbulances: (ambulances: AmbulanceUnit[]) => {
    setStoredItem(STORAGE_KEYS.AMBULANCES, ambulances);
  },

  getContacts: (): EmergencyContact[] => {
    return getStoredItem<EmergencyContact[]>(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS);
  },
  saveContacts: (contacts: EmergencyContact[]) => {
    setStoredItem(STORAGE_KEYS.CONTACTS, contacts);
  },

  getMedicalProfile: (): MedicalProfile => {
    return getStoredItem<MedicalProfile>(STORAGE_KEYS.MEDICAL_PROFILE, INITIAL_MEDICAL_PROFILE);
  },
  saveMedicalProfile: (profile: MedicalProfile) => {
    setStoredItem(STORAGE_KEYS.MEDICAL_PROFILE, profile);
  },

  getPastRequests: (): EmergencyRequest[] => {
    return getStoredItem<EmergencyRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_PAST_REQUESTS);
  },
  savePastRequests: (requests: EmergencyRequest[]) => {
    setStoredItem(STORAGE_KEYS.REQUESTS, requests);
  },

  getActiveEmergency: (): EmergencyRequest | null => {
    return getStoredItem<EmergencyRequest | null>(STORAGE_KEYS.ACTIVE_EMERGENCY, null);
  },
  saveActiveEmergency: (req: EmergencyRequest | null) => {
    setStoredItem(STORAGE_KEYS.ACTIVE_EMERGENCY, req);
  },

  getNotifications: (): AppNotification[] => {
    return getStoredItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
  saveNotifications: (notifs: AppNotification[]) => {
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  getSavedHospitalIds: (): string[] => {
    return getStoredItem<string[]>(STORAGE_KEYS.SAVED_HOSPITALS, ['hosp-1']);
  },
  saveSavedHospitalIds: (ids: string[]) => {
    setStoredItem(STORAGE_KEYS.SAVED_HOSPITALS, ids);
  },

  getUserLocation: (): LocationData => {
    const loc = getStoredItem<LocationData>(STORAGE_KEYS.USER_LOCATION, INITIAL_USER_LOCATION);
    if (loc && (loc.address.includes('Evergreen') || loc.latitude === 37.7749)) {
      return INITIAL_USER_LOCATION;
    }
    return loc;
  },
  saveUserLocation: (loc: LocationData) => {
    setStoredItem(STORAGE_KEYS.USER_LOCATION, loc);
  },

  resetToDemoDefaults: () => {
    localStorage.removeItem(STORAGE_KEYS.HOSPITALS);
    localStorage.removeItem(STORAGE_KEYS.AMBULANCES);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.MEDICAL_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_EMERGENCY);
    localStorage.removeItem(STORAGE_KEYS.SAVED_HOSPITALS);
    localStorage.removeItem(STORAGE_KEYS.USER_LOCATION);
  },
};
