export interface Lead {
  id: string;
  business_name: string;
  website: string;
  business_email: string;
  business_phone: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  industry: string;
  city: string;
  country: string;
}

export interface LeadData {
  leads: Lead[];
  verified_sources?: any[]; // Optional based on the provided JSON structure
}

export interface UserConfig {
  orgName: string;
  services: string;
}

export enum MessageType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP'
}