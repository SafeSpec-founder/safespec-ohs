/**
 * RegisterData interface for user registration
 */
export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  company?: string;
  jobTitle?: string;
  phoneNumber?: string;
}
