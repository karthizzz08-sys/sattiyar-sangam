// Mock backend using localStorage
export type Profile = {
  id: string;
  name: string;
  gender: "Male" | "Female";
  dob: string;
  age: number;
  phone: string;
  email: string;
  community: string;
  subCaste: string;
  education: string;
  occupation: string;
  salary: string;
  city: string;
  district: string;
  state: string;
  maritalStatus: string;
  photo?: string;
  photos?: string[];
  preferences?: { ageMin?: number; ageMax?: number; location?: string; education?: string };
  showContact?: boolean;
  approved?: boolean;
  createdAt: number;
};

const KEY = "sm_profiles";
const SESSION = "sm_session";

export function getProfiles(): Profile[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveProfiles(list: Profile[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}
export function addProfile(p: Profile) {
  const list = getProfiles();
  list.push(p);
  saveProfiles(list);
}
export function updateProfile(id: string, patch: Partial<Profile>) {
  const list = getProfiles().map(p => p.id === id ? { ...p, ...patch } : p);
  saveProfiles(list);
}
export function deleteProfile(id: string) {
  saveProfiles(getProfiles().filter(p => p.id !== id));
}

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION);
}
export function setSession(id: string | null) {
  if (id) localStorage.setItem(SESSION, id); else localStorage.removeItem(SESSION);
}
export function getCurrentUser(): Profile | null {
  const id = getCurrentUserId();
  if (!id) return null;
  return getProfiles().find(p => p.id === id) || null;
}
export function calcAge(dob: string): number {
  if (!dob) return 0;
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}
export function isAdmin(user: Profile | null) {
  return !!user && user.email === "admin@sattiyar.com";
}

// Seed sample profiles
export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (getProfiles().length > 0) return;
  const sample: Profile[] = [
    { id: "u1", name: "Priya Lakshmi", gender: "Female", dob: "1998-04-12", age: 27, phone: "9876500001", email: "priya@example.com", community: "Sattiyar", subCaste: "Sattiyar", education: "M.Sc Computer Science", occupation: "Software Engineer", salary: "8 LPA", city: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", maritalStatus: "Never Married", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600", approved: true, showContact: true, createdAt: Date.now() },
    { id: "u2", name: "Karthik Raja", gender: "Male", dob: "1995-08-22", age: 30, phone: "9876500002", email: "karthik@example.com", community: "Sattiyar", subCaste: "Sattiyar", education: "B.E Mechanical", occupation: "Project Manager", salary: "12 LPA", city: "Chennai", district: "Chennai", state: "Tamil Nadu", maritalStatus: "Never Married", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600", approved: true, showContact: true, createdAt: Date.now() },
    { id: "u3", name: "Divya Bharathi", gender: "Female", dob: "1996-11-03", age: 28, phone: "9876500003", email: "divya@example.com", community: "Sattiyar", subCaste: "Sattiyar", education: "MBA Finance", occupation: "Banker", salary: "10 LPA", city: "Madurai", district: "Madurai", state: "Tamil Nadu", maritalStatus: "Never Married", photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600", approved: true, showContact: true, createdAt: Date.now() },
    { id: "u4", name: "Arun Prakash", gender: "Male", dob: "1992-02-15", age: 33, phone: "9876500004", email: "arun@example.com", community: "Sattiyar", subCaste: "Sattiyar", education: "M.Tech IT", occupation: "Tech Lead", salary: "20 LPA", city: "Salem", district: "Salem", state: "Tamil Nadu", maritalStatus: "Never Married", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", approved: true, showContact: true, createdAt: Date.now() },
    { id: "u5", name: "Meena Kumari", gender: "Female", dob: "2000-06-18", age: 25, phone: "9876500005", email: "meena@example.com", community: "Sattiyar", subCaste: "Sattiyar", education: "B.Ed", occupation: "Teacher", salary: "5 LPA", city: "Erode", district: "Erode", state: "Tamil Nadu", maritalStatus: "Never Married", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600", approved: true, showContact: true, createdAt: Date.now() },
    { id: "u6", name: "Vignesh Kumar", gender: "Male", dob: "1994-09-30", age: 31, phone: "9876500006", email: "vignesh@example.com", community: "Sattiyar", subCaste: "Sattiyar", education: "B.Com", occupation: "Business Owner", salary: "15 LPA", city: "Tiruchirappalli", district: "Trichy", state: "Tamil Nadu", maritalStatus: "Never Married", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600", approved: true, showContact: true, createdAt: Date.now() },
    { id: "admin", name: "Admin", gender: "Male", dob: "1980-01-01", age: 45, phone: "9999999999", email: "admin@sattiyar.com", community: "Sattiyar", subCaste: "—", education: "—", occupation: "Administrator", salary: "—", city: "Chennai", district: "Chennai", state: "Tamil Nadu", maritalStatus: "Married", approved: true, showContact: false, createdAt: Date.now() },
  ];
  saveProfiles(sample);
}
