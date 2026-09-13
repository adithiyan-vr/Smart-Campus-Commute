export const INITIAL_USER = null;

export const CAMPUS_GATES = [
  'Gate 1 - Main Campus Gate',
  'Gate 2 - STEM Quad',
  'North Arts Plaza',
  'Athletics Arena Drop',
  'Health Sciences Center'
];

export const INITIAL_RIDES = [
  {
    id: 'ride_1',
    driver: {
      name: 'Sarah Chen',
      gender: 'female',
      isFemaleDriver: true,
      major: "CS '27",
      rating: 4.9,
      ridesCount: 112,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMzYXpRxejqmtt1S2EVoTR2kCF3VJaysuzxLtvFLBeEtHnSkBtcVlropxt7h0tRYWlTRvQ5gA95nqx3-8LxO-F48i81g3qhuHU4NV19BFMLOCNZoHtkk0RNE2ff0k4jl1eZpXpzHzLC7qu7O0esfpxOiYQ3OzxA-s3rYJuvzivDgL4MqWDJ8EBgl5ms9nKSqpSEc2tDeQ7hzxFtFfDlaQw7meMiVptlVhAaJkJ7FPb90PfRsi3Es3C5g',
      isVerified: true,
      tag: 'Verified .edu',
      mutualCourses: ['CS 301 Data Structures']
    },
    pickup: 'Oakwood Apartments',
    destination: 'Main Campus Gate',
    departureTime: '8:30 AM',
    distanceMiles: '1.7 miles',
    estimatedDuration: '8 mins',
    pricePerSeat: 50,
    availableSeats: 2,
    totalSeats: 4,
    carbonOffsetKg: 2.4,
    vehicleType: 'Sedan (Fuel Efficient)',
    vehiclePlate: '5CAL882',
    isEv: false,
    femaleOnly: true,
    coords: {
      pickup: [37.4180, -122.1790],
      destination: [37.4285, -122.1685]
    }
  },
  {
    id: 'ride_2',
    driver: {
      name: 'Marcus Miller',
      gender: 'male',
      isFemaleDriver: false,
      major: "MechEng '25",
      rating: 5.0,
      ridesCount: 84,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXVF-q8hAcKycvFFFKKw9RM3sb3Uxqqv3I0WMgO8M_pEZwfa0e-bJkF6oET8SV032eWRNi5QpDkgo_RpqJEJKnJ9qjmiiOVOWTDeOy8gb_qNR47FVrkgpagzzNEcKoLjwstGAVEDLnq1I8fZZt2GVPNN8SA0SB2sD5Ha16RGsh24pA4sKFC3rYjGWrSvxsFAA3KwGlE7wA5pHqrC47hNYFQIJAOsqBCZapW7knDHn6txwnQWnlMrktVg',
      isVerified: true,
      tag: 'EV Hybrid',
      mutualCourses: ['ENGR 210 Circuits']
    },
    pickup: 'Westwood Commons',
    destination: 'Eng Quad / Gate 2',
    departureTime: '8:45 AM',
    distanceMiles: '1.4 miles',
    estimatedDuration: '6 mins',
    pricePerSeat: 40,
    availableSeats: 1,
    totalSeats: 3,
    carbonOffsetKg: 3.1,
    vehicleType: 'Tesla Model 3',
    vehiclePlate: '9EVRIDE',
    isEv: true,
    femaleOnly: false,
    coords: {
      pickup: [37.4230, -122.1660],
      destination: [37.4300, -122.1730]
    }
  },
  {
    id: 'ride_3',
    driver: {
      name: 'Elena Rostova',
      gender: 'female',
      isFemaleDriver: true,
      major: "Bio '26",
      rating: 4.8,
      ridesCount: 67,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhzXZ0hq9gLOFEPHlQ9MrkdyOzn2Fl0kB5eihONx5oSbl4BombkEscLyL82wFtlGwkmWY5yiKVhnQ3O_e1QQ-dWoloVgl4mOnM-NZngaZ946IhVoVRfo57jh6VLXi9p9pN7_X7Stqt5IO6ux1SPa_h7C7eghWev1bL2JkwjS3_mttaLyXPkIdbLM2S28zDu2-QsHeM-Av22LLy-fRRpUaC-TlMnLIgnpLMNocahv8BS09cPIqORTjchw',
      isVerified: true,
      tag: 'Safe Commuter',
      mutualCourses: ['MATH 240 Linear Algebra']
    },
    pickup: 'Southside Metro Station',
    destination: 'Main Campus Gate',
    departureTime: '9:00 AM',
    distanceMiles: '0.7 miles',
    estimatedDuration: '3 mins',
    pricePerSeat: 60,
    availableSeats: 3,
    totalSeats: 4,
    carbonOffsetKg: 4.0,
    vehicleType: 'Honda CR-V',
    vehiclePlate: '8BTY991',
    isEv: false,
    femaleOnly: true,
    coords: {
      pickup: [37.4340, -122.1610],
      destination: [37.4285, -122.1685]
    }
  },
  {
    id: 'ride_4',
    driver: {
      name: 'Ananya Patel',
      gender: 'female',
      isFemaleDriver: true,
      major: "DataSci '26",
      rating: 4.95,
      ridesCount: 94,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      isVerified: true,
      tag: 'EV Hybrid',
      mutualCourses: ['STATS 200 Probability']
    },
    pickup: 'Highland Park Commuter Lot',
    destination: 'Gate 2 - STEM Quad',
    departureTime: '9:15 AM',
    distanceMiles: '1.2 miles',
    estimatedDuration: '5 mins',
    pricePerSeat: 45,
    availableSeats: 3,
    totalSeats: 4,
    carbonOffsetKg: 3.6,
    vehicleType: 'Hyundai Ioniq Hybrid',
    vehiclePlate: '6ECO554',
    isEv: true,
    femaleOnly: true,
    coords: {
      pickup: [37.4210, -122.1820],
      destination: [37.4300, -122.1730]
    }
  }
];

export const INITIAL_USER_RIDES = [];

export const INITIAL_CHAT_MESSAGES = [];

export const INITIAL_WAITING_MEMBERS = [
  {
    id: 'wait_1',
    passenger: {
      name: 'Maya Lin',
      gender: 'female',
      major: "Design '26",
      rating: 4.9,
      ridesTaken: 38,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      isVerified: true,
      tag: 'Verified .edu',
      mutualCourses: ['DES 101 Visual Design']
    },
    pickup: 'Oakwood Apartments',
    destination: 'Main Campus Gate',
    desiredTime: '8:30 AM',
    distanceMiles: '1.7 miles',
    estimatedDuration: '8 mins',
    seatsNeeded: 1,
    offeredContribution: 50,
    femaleDriverPreferred: true,
    flexibleMinutes: 10,
    status: 'WAITING',
    coords: {
      pickup: [37.4180, -122.1790],
      destination: [37.4285, -122.1685]
    }
  },
  {
    id: 'wait_2',
    passenger: {
      name: 'Rohan Sharma',
      gender: 'male',
      major: "CS '25",
      rating: 4.95,
      ridesTaken: 52,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
      isVerified: true,
      tag: 'Verified .edu',
      mutualCourses: ['CS 301 Data Structures']
    },
    pickup: 'Westwood Commons',
    destination: 'Eng Quad / Gate 2',
    desiredTime: '8:45 AM',
    distanceMiles: '1.4 miles',
    estimatedDuration: '6 mins',
    seatsNeeded: 1,
    offeredContribution: 40,
    femaleDriverPreferred: false,
    flexibleMinutes: 15,
    status: 'WAITING',
    coords: {
      pickup: [37.4230, -122.1660],
      destination: [37.4300, -122.1730]
    }
  },
  {
    id: 'wait_3',
    passenger: {
      name: 'Chloe Vance',
      gender: 'female',
      major: "Econ '27",
      rating: 4.8,
      ridesTaken: 19,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      isVerified: true,
      tag: 'Freshman Commuter',
      mutualCourses: ['ECON 101 Microeconomics']
    },
    pickup: 'Southside Metro Station',
    destination: 'Main Campus Gate',
    desiredTime: '9:00 AM',
    distanceMiles: '0.7 miles',
    estimatedDuration: '3 mins',
    seatsNeeded: 1,
    offeredContribution: 35,
    femaleDriverPreferred: true,
    flexibleMinutes: 10,
    status: 'WAITING',
    coords: {
      pickup: [37.4340, -122.1610],
      destination: [37.4285, -122.1685]
    }
  },
  {
    id: 'wait_4',
    passenger: {
      name: 'Kevin Patel',
      gender: 'male',
      major: "MechEng '26",
      rating: 4.85,
      ridesTaken: 29,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      isVerified: true,
      tag: 'Engineering Peer',
      mutualCourses: ['ENGR 210 Circuits']
    },
    pickup: 'Highland Park Commuter Lot',
    destination: 'Gate 2 - STEM Quad',
    desiredTime: '9:15 AM',
    distanceMiles: '1.2 miles',
    estimatedDuration: '5 mins',
    seatsNeeded: 1,
    offeredContribution: 45,
    femaleDriverPreferred: false,
    flexibleMinutes: 5,
    status: 'WAITING',
    coords: {
      pickup: [37.4210, -122.1820],
      destination: [37.4300, -122.1730]
    }
  },
  {
    id: 'wait_5',
    passenger: {
      name: 'Priya Nair',
      gender: 'female',
      major: "Bio '26",
      rating: 4.9,
      ridesTaken: 41,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      isVerified: true,
      tag: 'Verified .edu',
      mutualCourses: ['MATH 240 Linear Algebra']
    },
    pickup: 'Dormitory North / Off-Campus Quad',
    destination: 'Main Campus Gate',
    desiredTime: '9:30 AM',
    distanceMiles: '1.0 miles',
    estimatedDuration: '4 mins',
    seatsNeeded: 2,
    offeredContribution: 40,
    femaleDriverPreferred: true,
    flexibleMinutes: 10,
    status: 'WAITING',
    coords: {
      pickup: [37.4350, -122.1720],
      destination: [37.4285, -122.1685]
    }
  }
];

export const INITIAL_ADMIN_DATA = {
  metrics: {
    totalUsers: 1, // Only administrative account initially
    activeRides: 4,
    ridesCompletedToday: 142,
    pendingVerifications: 3,
    openReports: 2,
    totalCo2SavedKg: 1842.6
  },
  users: [],
  verifications: [
    { id: 'v1', studentName: 'Jordan Hayes', email: 'jordan.h@university.edu', docType: 'Student ID Card & DL', date: 'Today, 7:40 AM', status: 'PENDING' },
    { id: 'v2', studentName: 'Kevin Patel', email: 'k.patel@university.edu', docType: 'Vehicle Insurance & RC', date: 'Today, 8:15 AM', status: 'PENDING' },
    { id: 'v3', studentName: 'Avery Washington', email: 'avery.w@university.edu', docType: 'University Staff ID', date: 'Yesterday', status: 'PENDING' }
  ],
  reports: [
    { id: 'rep_1', reportedBy: 'Liam Davis', subject: 'Driver No-Show at Metro Station', rideId: 'ride_88', status: 'UNDER_REVIEW', severity: 'Medium' },
    { id: 'rep_2', reportedBy: 'Mia Wong', subject: 'Aggressive speeding along Campus Drive', rideId: 'ride_91', status: 'NEW', severity: 'High' }
  ],
  announcements: [
    { id: 'ann_1', title: 'Spring Campus Carpool Week: Double Eco-Credits!', date: 'Oct 20', target: 'All Campus' },
    { id: 'ann_2', title: 'Construction Notice: East Gate Closed for Repaving', date: 'Oct 22', target: 'Drivers' }
  ]
};
