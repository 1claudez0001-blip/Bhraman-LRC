export const ROOMS = [
  { id: '201A', name: 'Discussion Room 1', capacity: 6 },
  { id: '202B', name: 'Discussion Room 2', capacity: 8 },
];

export const INITIAL_BOOKS = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', college: 'ceas' },
  { id: 2, title: '1984', author: 'George Orwell', college: 'cenar' },
  { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', college: 'gen-ed' },
  { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', college: 'gen-ed' },
  { id: 5, title: 'Wuthering Heights', author: 'Emily Brontë', college: 'ceas' },
  { id: 6, title: 'Animal Farm', author: 'George Orwell', college: 'cenar' },
  { id: 7, title: 'Noli Me Tangere', author: 'José Rizal', college: 'ccje' },
  { id: 8, title: 'El Filibusterismo', author: 'José Rizal', college: 'ccje' },
];

export const COLLEGE_LABELS = {
  all: 'All Books',
  cenar: 'CENAR',
  ccje: 'CCJE',
  ceas: 'CEAS',
  citec: 'CITEC',
  cmt: 'CMT',
  centhre: 'CENTHRE',
  ccbba: 'CCBBA',
  'gen-ed': 'GEN ED BOOKS',
  journals: 'JOURNALS',
};

export const COLLEGE_KEYS = ['cenar', 'ccje', 'ceas', 'citec', 'cmt', 'centhre', 'ccbba', 'gen-ed', 'journals'];

export const DEMO_CREDENTIALS = {
  student: { username: 'user123', password: 'pass123', name: 'Juan Dela Cruz', userId: '201900123' },
  admin: { username: 'admin', password: 'admin123', name: 'Dr. Maria Santos', userId: 'A-001' },
};

export const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-600',
};

export const LMS_URL = 'https://ubian.ub.edu.ph/site/not_logged_in?from=%2Fuser_dashboard&log_in_required=true';
export const LRC_URL = 'https://sites.google.com/view/ub-lipa-library/home';
export const UB_LOGO_URL = 'https://ub.edu.ph/wp-content/uploads/2023/02/cropped-full-color-UB-Master-Logo.png';

// Time slots 8:00 AM - 5:30 PM, 30-min increments (20 slots)
export const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 8; h <= 17; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, '0');
      const mm = m === 0 ? '00' : '30';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      slots.push({ value: `${hh}:${mm}`, label: `${hour12}:${mm} ${ampm}` });
    }
  }
  return slots;
})();