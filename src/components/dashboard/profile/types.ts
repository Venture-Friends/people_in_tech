export interface WorkExperienceEntry {
  id?: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  order: number;
}

export interface EducationEntry {
  id?: string;
  institution: string;
  degree?: string;
  field?: string;
  startYear: number;
  endYear?: number;
  order: number;
}

export interface CertificationEntry {
  id?: string;
  name: string;
  issuer?: string;
  year?: number;
  order: number;
}

export interface SpokenLanguageEntry {
  id?: string;
  name: string;
  proficiency: "NATIVE" | "FLUENT" | "CONVERSATIONAL" | "BASIC";
}

export interface ProfileFormData {
  // User fields
  name: string;
  avatarUrl: string;
  bio: string;
  publicTitle: string;
  linkedinUrl: string;
  website: string;
  isProfilePublic: boolean;

  // CandidateProfile scalar fields
  headline: string;
  experienceLevel: string;
  skills: string[];
  roleInterests: string[];
  industries: string[];
  preferredLocations: string[];
  portfolioUrl: string;
  githubUrl: string;
  availability: string;
  preferredWorkType: string;
  salaryExpectation: string;
  allowContactEmail: boolean;
}

export interface FullProfileData extends ProfileFormData {
  id: string;
  email: string;
  cvUrl: string;
  workExperiences: WorkExperienceEntry[];
  educations: EducationEntry[];
  certifications: CertificationEntry[];
  spokenLanguages: SpokenLanguageEntry[];
}
