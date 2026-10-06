import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  EmergencyCategory,
  EmergencyRequest,
  EmergencyStatus,
  Hospital,
  AmbulanceUnit,
  EmergencyContact,
  MedicalProfile,
  AppNotification,
  ToastMessage,
  LocationData,
} from '../types';
import { StorageService } from '../services/storageService';
import { INITIAL_USER_LOCATION } from '../services/mockData';

export type NavigationPage =
  | 'home'
  | 'dashboard'
  | 'sos'
  | 'hospitals'
  | 'ambulance'
  | 'contacts'
  | 'medical-card'
  | 'first-aid'
  | 'services'
  | 'history'
  | 'profile'
  | 'admin';

interface AppContextType {
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  // SOS & Emergency
  isSOSModalOpen: boolean;
  openSOSModal: (category?: EmergencyCategory) => void;
  closeSOSModal: () => void;
  activeEmergency: EmergencyRequest | null;
  triggerEmergency: (category: EmergencyCategory, customNotes?: string) => Promise<EmergencyRequest>;
  cancelEmergency: () => void;
  updateEmergencyStatus: (status: EmergencyStatus) => void;
  pastRequests: EmergencyRequest[];
  // Ambulance
  ambulanceUnits: AmbulanceUnit[];
  activeAmbulance: AmbulanceUnit | null;
  requestAmbulance: (formData: {
    patientName: string;
    category: EmergencyCategory;
    pickupLocation: string;
    contactNumber: string;
    additionalNotes?: string;
  }) => Promise<void>;
  cancelAmbulanceRequest: () => void;
  // Hospitals
  hospitals: Hospital[];
  setHospitals: React.Dispatch<React.SetStateAction<Hospital[]>>;
  selectedHospital: Hospital | null;
  setSelectedHospital: (hosp: Hospital | null) => void;
  savedHospitalIds: string[];
  toggleSaveHospital: (hospId: string) => void;
  isHospitalDetailsOpen: boolean;
  setIsHospitalDetailsOpen: (open: boolean) => void;
  addHospital: (hosp: Omit<Hospital, 'id'>) => void;
  updateHospital: (hosp: Hospital) => void;
  deleteHospital: (id: string) => void;
  // Contacts
  contacts: EmergencyContact[];
  addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  updateContact: (contact: EmergencyContact) => void;
  deleteContact: (id: string) => void;
  setPrimaryContact: (id: string) => void;
  // Medical Profile
  medicalProfile: MedicalProfile;
  updateMedicalProfile: (profile: Partial<MedicalProfile>) => void;
  profileCompletionPercentage: number;
  // Location
  userLocation: LocationData;
  setUserLocation: React.Dispatch<React.SetStateAction<LocationData>>;
  detectLocation: () => Promise<void>;
  isDetectingLocation: boolean;
  // Notifications
  notifications: AppNotification[];
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Search
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  // Demo call modal
  callModalInfo: { isOpen: boolean; targetName: string; phoneNumber: string } | null;
  initiateDemoCall: (targetName: string, phoneNumber: string) => void;
  closeDemoCall: () => void;
  // Offline status & modal
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulateOffline: () => void;
  isOfflineModalOpen: boolean;
  setIsOfflineModalOpen: (open: boolean) => void;
  // Gemini Chatbot
  isChatbotOpen: boolean;
  setIsChatbotOpen: (open: boolean) => void;
  // Reset demo
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [sosCategoryPreselect, setSosCategoryPreselect] = useState<EmergencyCategory | undefined>(undefined);

  // Storage-backed states
  const [hospitals, setHospitals] = useState<Hospital[]>(() => StorageService.getHospitals());
  const [ambulanceUnits, setAmbulanceUnits] = useState<AmbulanceUnit[]>(() => StorageService.getAmbulances());
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => StorageService.getContacts());
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile>(() => StorageService.getMedicalProfile());
  const [pastRequests, setPastRequests] = useState<EmergencyRequest[]>(() => StorageService.getPastRequests());
  const [activeEmergency, setActiveEmergency] = useState<EmergencyRequest | null>(() => StorageService.getActiveEmergency());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications());
  const [savedHospitalIds, setSavedHospitalIds] = useState<string[]>(() => StorageService.getSavedHospitalIds());
  const [userLocation, setUserLocation] = useState<LocationData>(() => StorageService.getUserLocation());

  // Interactive UI states
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isHospitalDetailsOpen, setIsHospitalDetailsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [callModalInfo, setCallModalInfo] = useState<{ isOpen: boolean; targetName: string; phoneNumber: string } | null>(null);

  // Toast Helper
  const showToast = useCallback((title: string, message?: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Network online / offline state
  const [realOnlineStatus, setRealOnlineStatus] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const isOnline = realOnlineStatus && !isSimulatedOffline;

  useEffect(() => {
    const handleOnline = () => {
      setRealOnlineStatus(true);
      if (!isSimulatedOffline) {
        showToast('Network Connected', 'Live hospital telemetry and ambulance sync restored.', 'success');
      }
    };
    const handleOffline = () => {
      setRealOnlineStatus(false);
      showToast('Network Offline', 'Switched to offline emergency cache. First aid & medical ID remain active.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline, showToast]);

  const toggleSimulateOffline = useCallback(() => {
    setIsSimulatedOffline(prev => {
      const next = !prev;
      if (next) {
        showToast('Offline Mode Simulated', 'Offline Emergency Cache active. First aid & medical card remain 100% accessible.', 'warning');
      } else {
        showToast('Online Mode Restored', 'Live GPS dispatch and hospital telemetry re-connected.', 'success');
      }
      return next;
    });
  }, [showToast]);

  // Active ambulance tracking
  const activeAmbulance = useMemo(() => {
    if (!activeEmergency?.ambulanceUnitCode) return null;
    return ambulanceUnits.find(a => a.unitCode === activeEmergency.ambulanceUnitCode) || null;
  }, [activeEmergency, ambulanceUnits]);

  // Sync to Storage
  useEffect(() => {
    StorageService.saveHospitals(hospitals);
  }, [hospitals]);

  useEffect(() => {
    StorageService.saveAmbulances(ambulanceUnits);
  }, [ambulanceUnits]);

  useEffect(() => {
    StorageService.saveContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    StorageService.saveMedicalProfile(medicalProfile);
  }, [medicalProfile]);

  useEffect(() => {
    StorageService.savePastRequests(pastRequests);
  }, [pastRequests]);

  useEffect(() => {
    StorageService.saveActiveEmergency(activeEmergency);
  }, [activeEmergency]);

  useEffect(() => {
    StorageService.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    StorageService.saveSavedHospitalIds(savedHospitalIds);
  }, [savedHospitalIds]);

  useEffect(() => {
    StorageService.saveUserLocation(userLocation);
  }, [userLocation]);

  // Notifications
  const addNotification = useCallback((title: string, message: string, type: AppNotification['type'] = 'system') => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      isRead: false,
      type,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('Notifications Marked Read', 'All notifications are now cleared.', 'info');
  }, [showToast]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // SOS Modals
  const openSOSModal = useCallback((category?: EmergencyCategory) => {
    setSosCategoryPreselect(category);
    setIsSOSModalOpen(true);
  }, []);

  const closeSOSModal = useCallback(() => {
    setIsSOSModalOpen(false);
  }, []);

  // Geolocation detector
  const detectLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          let realAddress = `Coordinates: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
          try {
            const geoRes = await fetch(`/api/maps/geocode?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData.results && geoData.results.length > 0) {
                realAddress = geoData.results[0].formatted_address;
              }
            }
          } catch {
            // fallback
          }

          const updated: LocationData = {
            address: realAddress,
            landmark: `Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)}`,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: Math.round(pos.coords.accuracy),
          };
          setUserLocation(updated);
          setIsDetectingLocation(false);
          showToast('Location Detected', 'Your device coordinates have been updated.', 'success');
        },
        (err) => {
          setIsDetectingLocation(false);
          showToast('Location Permission', err.message || 'Location access was not granted.', 'warning');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setIsDetectingLocation(false);
      showToast('Geolocation Unsupported', 'Your browser does not support location detection.', 'warning');
    }
  }, [showToast]);

  // Trigger Emergency SOS
  const triggerEmergency = useCallback(async (category: EmergencyCategory, customNotes?: string): Promise<EmergencyRequest> => {
    const categoryLabels: Record<EmergencyCategory, string> = {
      accident: 'Accident & Trauma',
      breathing: 'Breathing Difficulty',
      chest_discomfort: 'Chest Discomfort / Cardiac',
      injury: 'Acute Injury / Bleeding',
      sudden_illness: 'Sudden Severe Illness',
      fire: 'Fire & Burn Emergency',
      other: 'Critical Emergency',
    };

    const nearestHosp = hospitals[0] || null;
    const assignedAmbulance = ambulanceUnits.find(a => a.status === 'Available') || ambulanceUnits[0];

    const newRequest: EmergencyRequest = {
      id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      category,
      categoryLabel: categoryLabels[category],
      status: 'assigned',
      patientName: medicalProfile.fullName,
      contactNumber: contacts.find(c => c.isPrimary)?.phone || '+1 (555) 892-4411',
      location: userLocation,
      hospitalName: nearestHosp?.name || 'Nearest Regional Emergency Center',
      ambulanceUnitCode: assignedAmbulance.unitCode,
      etaMinutes: 4,
      notes: customNotes || `Pre-existing: ${medicalProfile.existingConditions.join(', ') || 'None reported'}. Blood group: ${medicalProfile.bloodGroup}.`,
      severity: 'Critical',
    };

    setActiveEmergency(newRequest);
    setPastRequests(prev => [newRequest, ...prev]);

    // Update assigned ambulance status
    setAmbulanceUnits(prev =>
      prev.map(a => a.id === assignedAmbulance.id ? { ...a, status: 'En Route', currentEtaMinutes: 4 } : a)
    );

    addNotification(
      'Emergency SOS Dispatched',
      `${newRequest.categoryLabel} dispatched to ${newRequest.hospitalName}. ETA 4 mins.`,
      'emergency'
    );

    showToast(
      'Emergency SOS Activated',
      `Assigned ${assignedAmbulance.unitCode} (${assignedAmbulance.driverName}). Triage ready at ${nearestHosp?.name}.`,
      'success'
    );

    setIsSOSModalOpen(false);
    setCurrentPage('sos');
    return newRequest;
  }, [hospitals, ambulanceUnits, medicalProfile, contacts, userLocation, addNotification, showToast]);

  // Update Emergency Status
  const updateEmergencyStatus = useCallback((status: EmergencyStatus) => {
    if (!activeEmergency) return;
    const updated = { ...activeEmergency, status };
    setActiveEmergency(updated);
    setPastRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
    
    if (status === 'resolved' || status === 'cancelled') {
      // Free the ambulance
      if (activeEmergency.ambulanceUnitCode) {
        setAmbulanceUnits(prev =>
          prev.map(a => a.unitCode === activeEmergency.ambulanceUnitCode ? { ...a, status: 'Available' } : a)
        );
      }
      addNotification(
        status === 'resolved' ? 'Emergency Case Resolved' : 'Emergency Request Cancelled',
        `Incident ${activeEmergency.id} marked as ${status}.`,
        'emergency'
      );
      showToast('Status Updated', `Emergency ticket ${activeEmergency.id} is now ${status}.`, 'info');
      setActiveEmergency(null);
    } else {
      showToast('Emergency Status Updated', `Status changed to: ${status.replace('_', ' ').toUpperCase()}`, 'info');
    }
  }, [activeEmergency, addNotification, showToast]);

  const cancelEmergency = useCallback(() => {
    updateEmergencyStatus('cancelled');
  }, [updateEmergencyStatus]);

  // Request Ambulance
  const requestAmbulance = useCallback(async (formData: {
    patientName: string;
    category: EmergencyCategory;
    pickupLocation: string;
    contactNumber: string;
    additionalNotes?: string;
  }) => {
    const assignedAmbulance = ambulanceUnits.find(a => a.status === 'Available') || ambulanceUnits[0];
    const categoryLabels: Record<EmergencyCategory, string> = {
      accident: 'Accident & Trauma',
      breathing: 'Breathing Difficulty',
      chest_discomfort: 'Chest Discomfort / Cardiac',
      injury: 'Acute Injury / Bleeding',
      sudden_illness: 'Sudden Severe Illness',
      fire: 'Fire & Burn Emergency',
      other: 'Medical Transport',
    };

    const newRequest: EmergencyRequest = {
      id: `AMB-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      category: formData.category,
      categoryLabel: categoryLabels[formData.category],
      status: 'assigned',
      patientName: formData.patientName,
      contactNumber: formData.contactNumber,
      location: {
        address: formData.pickupLocation,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
      hospitalName: hospitals[0]?.name || 'Nearest Regional Emergency Center',
      ambulanceUnitCode: assignedAmbulance.unitCode,
      etaMinutes: 5,
      notes: formData.additionalNotes,
      severity: 'Urgent',
    };

    setActiveEmergency(newRequest);
    setPastRequests(prev => [newRequest, ...prev]);

    setAmbulanceUnits(prev =>
      prev.map(a => a.id === assignedAmbulance.id ? { ...a, status: 'En Route', currentEtaMinutes: 5 } : a)
    );

    addNotification(
      'Ambulance Unit Dispatched',
      `${assignedAmbulance.unitCode} en route to ${formData.pickupLocation}.`,
      'ambulance'
    );

    showToast(
      'Ambulance Request Dispatched',
      `Unit ${assignedAmbulance.unitCode} assigned to ${formData.patientName}. Est. arrival: 5 mins.`,
      'success'
    );
  }, [ambulanceUnits, hospitals, userLocation, addNotification, showToast]);

  const cancelAmbulanceRequest = useCallback(() => {
    cancelEmergency();
  }, [cancelEmergency]);

  // Hospital Actions
  const toggleSaveHospital = useCallback((hospId: string) => {
    setSavedHospitalIds(prev => {
      const exists = prev.includes(hospId);
      const updated = exists ? prev.filter(id => id !== hospId) : [...prev, hospId];
      showToast(
        exists ? 'Hospital Removed' : 'Hospital Saved',
        exists ? 'Removed from your emergency favorites.' : 'Added to quick-access favorites.',
        'info'
      );
      return updated;
    });
  }, [showToast]);

  const addHospital = useCallback((hosp: Omit<Hospital, 'id'>) => {
    const newHosp: Hospital = {
      ...hosp,
      id: `hosp-${Date.now()}`,
    };
    setHospitals(prev => [newHosp, ...prev]);
    showToast('Hospital Added', `${newHosp.name} registered into directory.`, 'success');
  }, [showToast]);

  const updateHospital = useCallback((hosp: Hospital) => {
    setHospitals(prev => prev.map(h => h.id === hosp.id ? hosp : h));
    showToast('Hospital Updated', `${hosp.name} data updated.`, 'info');
  }, [showToast]);

  const deleteHospital = useCallback((id: string) => {
    const target = hospitals.find(h => h.id === id);
    setHospitals(prev => prev.filter(h => h.id !== id));
    showToast('Hospital Removed', `${target?.name || 'Facility'} deleted from registry.`, 'warning');
  }, [hospitals, showToast]);

  // Contact Actions
  const addContact = useCallback((contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: `cnt-${Date.now()}`,
    };
    setContacts(prev => {
      if (newContact.isPrimary) {
        return [newContact, ...prev.map(c => ({ ...c, isPrimary: false }))];
      }
      return [...prev, newContact];
    });
    addNotification('Emergency Contact Added', `${newContact.name} (${newContact.relationship}) registered.`, 'contact');
    showToast('Contact Saved', `${newContact.name} added to your emergency circle.`, 'success');
  }, [addNotification, showToast]);

  const updateContact = useCallback((contact: EmergencyContact) => {
    setContacts(prev => {
      if (contact.isPrimary) {
        return prev.map(c => c.id === contact.id ? contact : { ...c, isPrimary: false });
      }
      return prev.map(c => c.id === contact.id ? contact : c);
    });
    showToast('Contact Updated', `${contact.name}'s details saved.`, 'info');
  }, [showToast]);

  const deleteContact = useCallback((id: string) => {
    const target = contacts.find(c => c.id === id);
    setContacts(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (target?.isPrimary && remaining.length > 0) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
    showToast('Contact Deleted', `${target?.name || 'Contact'} removed.`, 'warning');
  }, [contacts, showToast]);

  const setPrimaryContact = useCallback((id: string) => {
    setContacts(prev => prev.map(c => ({ ...c, isPrimary: c.id === id })));
    const target = contacts.find(c => c.id === id);
    showToast('Primary Contact Set', `${target?.name || 'Contact'} is now designated as #1 emergency responder.`, 'success');
  }, [contacts, showToast]);

  // Medical Profile Actions
  const updateMedicalProfile = useCallback((updates: Partial<MedicalProfile>) => {
    setMedicalProfile(prev => {
      const merged = { ...prev, ...updates };
      return merged;
    });
    addNotification('Medical Profile Updated', 'Health emergency information was synchronized.', 'profile');
    showToast('Medical Profile Saved', 'Emergency medical card has been updated.', 'success');
  }, [addNotification, showToast]);

  // Profile completion calculation
  const profileCompletionPercentage = useMemo(() => {
    let score = 0;
    if (medicalProfile.fullName) score += 15;
    if (medicalProfile.age) score += 10;
    if (medicalProfile.bloodGroup) score += 15;
    if (medicalProfile.allergies.length > 0) score += 15;
    if (medicalProfile.existingConditions.length > 0) score += 10;
    if (medicalProfile.currentMedications.length > 0) score += 10;
    if (medicalProfile.emergencyNotes) score += 10;
    if (contacts.length >= 2) score += 15;
    else if (contacts.length === 1) score += 10;
    return Math.min(score, 100);
  }, [medicalProfile, contacts]);

  // Demo Call Simulation
  const initiateDemoCall = useCallback((targetName: string, phoneNumber: string) => {
    setCallModalInfo({
      isOpen: true,
      targetName,
      phoneNumber,
    });
  }, []);

  const closeDemoCall = useCallback(() => {
    setCallModalInfo(null);
  }, []);

  const resetDemoData = useCallback(() => {
    StorageService.resetToDemoDefaults();
    setHospitals(StorageService.getHospitals());
    setAmbulanceUnits(StorageService.getAmbulances());
    setContacts(StorageService.getContacts());
    setMedicalProfile(StorageService.getMedicalProfile());
    setPastRequests(StorageService.getPastRequests());
    setActiveEmergency(null);
    setNotifications(StorageService.getNotifications());
    setSavedHospitalIds(['hosp-1']);
    setUserLocation(INITIAL_USER_LOCATION);
    showToast('Demo Reset', 'Default simulation data restored.', 'info');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        isSOSModalOpen,
        openSOSModal,
        closeSOSModal,
        activeEmergency,
        triggerEmergency,
        cancelEmergency,
        updateEmergencyStatus,
        pastRequests,
        ambulanceUnits,
        activeAmbulance,
        requestAmbulance,
        cancelAmbulanceRequest,
        hospitals,
        setHospitals,
        selectedHospital,
        setSelectedHospital,
        savedHospitalIds,
        toggleSaveHospital,
        isHospitalDetailsOpen,
        setIsHospitalDetailsOpen,
        addHospital,
        updateHospital,
        deleteHospital,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        setPrimaryContact,
        medicalProfile,
        updateMedicalProfile,
        profileCompletionPercentage,
        userLocation,
        setUserLocation,
        detectLocation,
        isDetectingLocation,
        notifications,
        isNotificationsOpen,
        setIsNotificationsOpen,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        isSearchOpen,
        setIsSearchOpen,
        toasts,
        showToast,
        removeToast,
        callModalInfo,
        initiateDemoCall,
        closeDemoCall,
        isOnline,
        isSimulatedOffline,
        toggleSimulateOffline,
        isOfflineModalOpen,
        setIsOfflineModalOpen,
        isChatbotOpen,
        setIsChatbotOpen,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
