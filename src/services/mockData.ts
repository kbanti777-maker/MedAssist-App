import {
  Hospital,
  AmbulanceUnit,
  EmergencyContact,
  MedicalProfile,
  FirstAidTopic,
  EmergencyServiceItem,
  AppNotification,
  EmergencyRequest,
} from '../types';

import heroImg from '../assets/images/hero_emergency_paramedics_1791297347958.jpg';
import hospitalImg from '../assets/images/hospital_facility_exterior_1791297360520.jpg';
import ambulanceImg from '../assets/images/ambulance_fleet_vehicle_1791297373072.jpg';

export const ASSET_IMAGES = {
  hero: heroImg,
  hospital: hospitalImg,
  ambulance: ambulanceImg,
};

export const INITIAL_USER_LOCATION = {
  address: 'Detecting device location...',
  landmark: 'GPS Verified Device Position',
  latitude: 0,
  longitude: 0,
  accuracyMeters: 0,
};

// All hospitals must come from real Google Places API queries based on user's actual location
export const INITIAL_HOSPITALS: Hospital[] = [];

export const INITIAL_AMBULANCES: AmbulanceUnit[] = [
  {
    id: 'amb-101',
    unitCode: 'Medic-Unit 402',
    type: 'Advanced Life Support (ALS)',
    driverName: 'Marcus Bennett',
    paramedicLead: 'Capt. Sarah Jenkins (EMT-P)',
    status: 'Available',
    phone: '(555) 911-0402',
    baseHospital: 'Regional Emergency Trauma Base',
    plateNumber: 'MED-402-CA',
    currentEtaMinutes: 5,
  },
  {
    id: 'amb-102',
    unitCode: 'Rescue-Unit 215',
    type: 'Critical Care Transport',
    driverName: 'Elena Rostova',
    paramedicLead: 'Dr. Michael Chen (Flight Doc)',
    status: 'Available',
    phone: '(555) 911-0215',
    baseHospital: 'Metro Emergency Dispatch Base',
    plateNumber: 'MED-215-CA',
    currentEtaMinutes: 8,
  },
  {
    id: 'amb-103',
    unitCode: 'Squad-Unit 108',
    type: 'Basic Life Support (BLS)',
    driverName: 'David Kim',
    paramedicLead: 'Rachel Adams (AEMT)',
    status: 'Available',
    phone: '(555) 911-0108',
    baseHospital: 'Mercy Heart & Vascular',
    plateNumber: 'MED-108-CA',
    currentEtaMinutes: 6,
  },
  {
    id: 'amb-104',
    unitCode: 'Peds-Unit 305',
    type: 'Neonatal / Pediatric',
    driverName: 'Liam Cooper',
    paramedicLead: 'Nurse Samantha Wright (RN, CCRN)',
    status: 'Standby',
    phone: '(555) 911-0305',
    baseHospital: 'Valley Children’s Hospital',
    plateNumber: 'MED-305-CA',
    currentEtaMinutes: 11,
  },
];

export const INITIAL_CONTACTS: EmergencyContact[] = [
  {
    id: 'cnt-1',
    name: 'Eleanor Harrison',
    relationship: 'Spouse',
    phone: '+1 (555) 892-4411',
    alternatePhone: '+1 (555) 892-4412',
    isPrimary: true,
    email: 'eleanor.harrison@domain.com',
  },
  {
    id: 'cnt-2',
    name: 'Dr. Robert Sterling',
    relationship: 'Primary Doctor',
    phone: '+1 (555) 774-2099',
    isPrimary: false,
    email: 'dr.sterling@metrohealth.org',
  },
  {
    id: 'cnt-3',
    name: 'Thomas Harrison',
    relationship: 'Parent',
    phone: '+1 (555) 631-9870',
    isPrimary: false,
    email: 'thomas.harrison@domain.com',
  },
];

export const INITIAL_MEDICAL_PROFILE: MedicalProfile = {
  id: 'prof-user',
  fullName: 'Alexander Vance',
  age: 34,
  dateOfBirth: '1992-04-18',
  bloodGroup: 'O+',
  allergies: ['Penicillin', 'Peanuts', 'Latex (Mild)'],
  existingConditions: ['Asthma (Mild, Exercise-Induced)', 'Hypertension (Stage 1 controlled)'],
  currentMedications: ['Albuterol Inhaler (PRN)', 'Lisinopril 10mg (Daily)'],
  emergencyNotes: 'Carries rescue inhaler in commuter bag. Severe allergy to penicillin-class antibiotics.',
  primaryDoctor: {
    name: 'Dr. Robert Sterling, MD',
    hospital: 'Metro Health Academic Hospital',
    phone: '+1 (555) 774-2099',
  },
  organDonor: true,
  insuranceProvider: 'BlueShield Premier Medical',
  policyNumber: 'BS-88941032-X',
  weightKg: 78,
  heightCm: 182,
};

export const INITIAL_FIRST_AID_GUIDES: FirstAidTopic[] = [
  {
    id: 'fa-cpr',
    title: 'Hands-Only CPR & Cardiac Arrest',
    category: 'CPR Basics',
    icon: 'HeartPulse',
    summary: 'Immediate chest compressions double or triple chances of survival after sudden cardiac arrest.',
    severityLevel: 'Critical',
    steps: [
      'Verify scene safety and tap patient\'s shoulder firmly asking "Are you okay?".',
      'Check for normal breathing (not agonal gasping) for no more than 10 seconds.',
      'Immediately call emergency dispatch (911 / 112) or designate someone nearby to call.',
      'Place heel of one hand in the center of the chest, interlock the second hand fingers over it.',
      'Push hard and fast: 100 to 120 beats per minute (rhythm of "Stayin\' Alive") at 2 inches (5cm) depth.',
      'Allow complete chest recoil between each compression without removing hands.',
      'Continue uninterrupted until AED arrives or professional paramedics take over.'
    ],
    whatNotToDo: [
      'Do not delay compressions to check for faint pulses if unexperienced.',
      'Do not give rescue breaths if not trained in healthcare CPR—stick strictly to hands-only compressions.',
      'Do not stop compressions for longer than 10 seconds.'
    ],
    whenToSeekHelp: [
      'Immediately: any unresponsive patient without normal breathing constitutes a Code Critical emergency.'
    ]
  },
  {
    id: 'fa-bleeding',
    title: 'Severe Bleeding & Hemorrhage Control',
    category: 'Cuts & Bleeding',
    icon: 'ShieldAlert',
    summary: 'Rapid pressure application to stop blood loss and prevent hemorrhagic shock.',
    severityLevel: 'Critical',
    steps: [
      'Ensure personal protection (gloves or clean barrier if possible).',
      'Apply firm, continuous direct pressure over the bleeding wound using a sterile gauze or cleanest cloth available.',
      'If bleeding soaks through, do NOT remove the first pad; add more layers on top and press harder.',
      'For severe arterial bleeding from a limb that won\'t stop, apply a commercial tourniquet 2-3 inches above the wound (not on a joint).',
      'Keep patient calm, lying down, and cover with a blanket to preserve body warmth.'
    ],
    whatNotToDo: [
      'Do not remove embedded penetrating objects (knife, glass)—stabilize in place.',
      'Do not release pressure to "peek" if the bleeding has stopped.',
      'Do not apply a makeshift wire or narrow cord as a tourniquet.'
    ],
    whenToSeekHelp: [
      'Blood spurting in rhythm with heartbeat.',
      'Bleeding does not slow after 5 minutes of firm direct pressure.',
      'Patient exhibits dizziness, pale skin, or confusion.'
    ]
  },
  {
    id: 'fa-choking',
    title: 'Adult Choking & Airway Obstruction',
    category: 'Choking',
    icon: 'Activity',
    summary: 'Recognize universal choking sign and perform abdominal thrusts (Heimlich maneuver).',
    severityLevel: 'Critical',
    steps: [
      'Ask "Are you choking?". If the person can cough forcefully or speak, encourage them to keep coughing.',
      'If they cannot speak, breathe, or cough: Stand behind them, slightly off-center for balance.',
      'Give 5 firm back blows between shoulder blades with the heel of your hand.',
      'If unsuccessful, place a fist just above the navel (thumb-side in). Grasp fist with other hand.',
      'Deliver 5 quick inward and upward abdominal thrusts.',
      'Repeat 5 back blows and 5 thrusts until airway is clear.',
      'If victim loses consciousness, lower gently to floor and begin Hands-Only CPR.'
    ],
    whatNotToDo: [
      'Do not perform blind finger sweeps in the mouth—it can push the foreign object deeper.',
      'Do not slap the back while the person is standing upright without bending them forward.'
    ],
    whenToSeekHelp: [
      'Call emergency dispatch immediately if the first cycle of thrusts does not dislodge the object or patient collapses.'
    ]
  },
  {
    id: 'fa-burns',
    title: 'Thermal & Chemical Burns',
    category: 'Burns',
    icon: 'Flame',
    summary: 'Cooling the burn stops tissue destruction and relieves severe nerve pain.',
    severityLevel: 'Moderate',
    steps: [
      'Remove patient from heat source immediately.',
      'Cool the burn under gentle running cool tap water for 10 to 20 minutes.',
      'Gently remove jewelry or tight constricting clothing near the area before swelling starts.',
      'Cover loosely with a clean, dry, non-adherent dressing or clean plastic wrap.',
      'Elevate burned limb if possible above heart level to decrease edema.'
    ],
    whatNotToDo: [
      'Never apply ice, ice water, butter, oil, or toothpastes (they cause tissue necrosis).',
      'Never pop or puncture burn blisters.',
      'Do not forcibly remove clothing melted into charred skin.'
    ],
    whenToSeekHelp: [
      'Any burn larger than patient’s palm, or burns to face, hands, groin, or major joints.',
      'Burn appears white, charred, or leathery (3rd degree).',
      'Chemical or electrical burns.'
    ]
  },
  {
    id: 'fa-fainting',
    title: 'Fainting & Syncope Recovery',
    category: 'Fainting',
    icon: 'UserX',
    summary: 'Restoring blood flow to the brain safely while preventing fall injuries.',
    severityLevel: 'Mild',
    steps: [
      'Position patient flat on their back on a level surface.',
      'Elevate legs 8-12 inches (20-30 cm) if no spinal or leg injury is suspected.',
      'Loosen restrictive collars, belts, and ties.',
      'Ensure adequate ventilation; keep crowds back.',
      'Once conscious, keep patient lying down for 10-15 minutes before slowly sitting up.'
    ],
    whatNotToDo: [
      'Do not force the patient to stand up immediately upon waking.',
      'Do not throw cold water in the face or slap cheeks.',
      'Do not give anything to eat or drink until fully alert and stable.'
    ],
    whenToSeekHelp: [
      'Unconsciousness lasts longer than 60 seconds.',
      'Fainting occurred while exercising or was preceded by chest pain / palpitations.',
      'Head injury was sustained during the fall.'
    ]
  },
  {
    id: 'fa-sprains',
    title: 'Sprains, Strains & Suspected Fractures',
    category: 'Sprains & Fractures',
    icon: 'Bone',
    summary: 'The R.I.C.E. protocol to minimize joint swelling and stabilize musculoskeletal injuries.',
    severityLevel: 'Mild',
    steps: [
      'Rest: Stop activity and immobilize the injured extremity.',
      'Ice: Apply a cloth-wrapped cold pack for 15-20 minutes every 2-3 hours.',
      'Compression: Wrap lightly with an elastic bandage from distal to proximal.',
      'Elevation: Prop the injured area above heart level when resting.',
      'If fracture suspected (bone deformity), splint in the position found without forcing.'
    ],
    whatNotToDo: [
      'Do not apply ice directly onto bare skin (risk of frostbite).',
      'Do not try to straighten or pop a misaligned bone or joint back into place.',
      'Do not wrap elastic bandages so tightly that fingers/toes turn pale, blue, or numb.'
    ],
    whenToSeekHelp: [
      'Inability to bear any weight or severe visible limb deformity.',
      'Numbness, tingling, or loss of pulse below the injured site.'
    ]
  },
  {
    id: 'fa-heat',
    title: 'Heat Exhaustion vs Heat Stroke',
    category: 'Heat Illness',
    icon: 'Sun',
    summary: 'Critical differentiation between mild heat stress and life-threatening heat stroke.',
    severityLevel: 'Moderate',
    steps: [
      'Move patient to a shaded, air-conditioned environment immediately.',
      'Remove excess heavy clothing.',
      'Cool actively: apply cold wet towels, mist with cool water, and fan vigorously.',
      'Place ice packs wrapped in towels at neck, armpits, and groin.',
      'If alert and not vomiting, provide cool electrolyte water in slow sips.'
    ],
    whatNotToDo: [
      'Do not give salt tablets or cold caffeinated / alcoholic drinks.',
      'Do not assume heat illness is mild if the person stops sweating (hallmark of heat stroke).'
    ],
    whenToSeekHelp: [
      'Emergency Dispatch required if: confusion, slurred speech, seizures, vomiting, or body temp exceeds 103°F (39.4°C).'
    ]
  }
];

export const INITIAL_EMERGENCY_SERVICES: EmergencyServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Emergency Ambulance & Paramedic Dispatch',
    category: 'Ambulance',
    icon: 'Ambulance',
    phone: '911 / (555) 911-0000',
    hours: '24 Hours / 7 Days a week',
    address: 'Metro County Emergency Operations Center',
    description: 'Direct priority channel for Advanced Life Support and mobile paramedic units.',
    badge: 'Immediate Response',
  },
  {
    id: 'srv-2',
    name: 'Regional Poison Control Center',
    category: 'Poison Control',
    icon: 'AlertTriangle',
    phone: '1-800-222-1222',
    hours: '24/7 Free & Confidential',
    address: 'National Toxicology Advisory Hub',
    description: 'Expert medical advice on chemical exposure, medication overdose, venom, and household ingestions.',
    badge: 'Toxicology Experts',
  },
  {
    id: 'srv-3',
    name: 'Metro Trauma Center ER Department',
    category: 'Hospital ER',
    icon: 'Building2',
    phone: '(555) 234-9111',
    hours: '24/7 Always Open',
    address: '450 Healthcare Blvd, Emergency Entrance A',
    description: 'Level 1 surgical trauma bays, cardiac stroke resuscitation, and adult burn triage.',
    badge: 'Level 1 Trauma',
  },
  {
    id: 'srv-4',
    name: 'Emergency Blood Bank & Plasma Bank',
    category: 'Blood Bank',
    icon: 'Droplet',
    phone: '(555) 890-4444',
    hours: '24/7 Emergency Dispatch',
    address: '600 Red Cross Plaza, Medical Corridor',
    description: 'Emergency transfusion reserve, rare blood type matching (O-Negative supply), and platelet dispatch.',
    badge: 'O-Negative Available',
  },
  {
    id: 'srv-5',
    name: '24/7 MedCare Emergency Pharmacy',
    category: 'Pharmacy',
    icon: 'Pill',
    phone: '(555) 670-3322',
    hours: 'Open 24 Hours Daily',
    address: '772 Lexington Ave, Corner of 8th',
    description: 'Urgent medication dispensing, emergency rescue inhalers, EpiPens, and intravenous antibiotics.',
    badge: '24/7 Drive-Thru',
  },
  {
    id: 'srv-6',
    name: 'Downtown Urgent Care & Walk-In Clinic',
    category: 'Urgent Clinic',
    icon: 'Stethoscope',
    phone: '(555) 678-4400',
    hours: '7:00 AM - 11:00 PM Daily',
    address: '105 Market Square, West Plaza',
    description: 'Rapid treatment for minor fractures, stitches, asthma nebulization, and burns.',
    badge: 'Short Wait Times',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Medical ID Configured',
    message: 'Emergency medical profile is synchronized and ready for first responders.',
    timestamp: '15 mins ago',
    isRead: false,
    type: 'profile',
  },
  {
    id: 'notif-2',
    title: 'Emergency Contact Verified',
    message: 'Eleanor Harrison has been set as your primary emergency contact.',
    timestamp: '2 hours ago',
    isRead: false,
    type: 'contact',
  },
  {
    id: 'notif-3',
    title: 'Hospital Capacity Alert',
    message: 'Nearest Trauma Center has open ICU beds with standard emergency triage.',
    timestamp: 'Yesterday',
    isRead: true,
    type: 'emergency',
  },
];

export const INITIAL_PAST_REQUESTS: EmergencyRequest[] = [
  {
    id: 'req-2026-081',
    timestamp: '2026-09-14 14:22',
    category: 'breathing',
    categoryLabel: 'Severe Asthma / Breathing',
    status: 'resolved',
    patientName: 'Alexander Vance',
    contactNumber: '+1 (555) 892-4411',
    location: {
      address: '742 Evergreen Terrace, Westside',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    hospitalName: 'Regional Emergency Trauma Center',
    ambulanceUnitCode: 'Medic-Unit 402',
    etaMinutes: 4,
    notes: 'Nebulizer treatment administered on-scene. Patient stabilized.',
    severity: 'Severe',
  },
  {
    id: 'req-2026-044',
    timestamp: '2026-06-02 09:15',
    category: 'injury',
    categoryLabel: 'Sports Injury / Sprain',
    status: 'resolved',
    patientName: 'Alexander Vance',
    contactNumber: '+1 (555) 892-4411',
    location: {
      address: 'Westside Community Athletic Park',
      latitude: 37.7712,
      longitude: -122.4180,
    },
    hospitalName: 'Westside Urgent & Immediate Care',
    notes: 'Right ankle immobilization and diagnostic X-Ray performed.',
    severity: 'Urgent',
  },
];
