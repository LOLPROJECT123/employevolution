
export interface ReferralRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  company: string;
  position: string;
  message: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  company: string;
  position: string;
  openToReferrals: boolean;
}
