
import { z } from 'zod';

export interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  county: string;
  zipCode: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  standardizedAddress?: AddressComponents;
}

// US State abbreviations mapping
const US_STATES = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

export class AddressValidator {
  static validateZipCode(zipCode: string): { isValid: boolean; error?: string } {
    // US ZIP code patterns: 12345 or 12345-6789
    const zipPattern = /^\d{5}(-\d{4})?$/;
    
    if (!zipCode.trim()) {
      return { isValid: false, error: 'ZIP code is required' };
    }
    
    if (!zipPattern.test(zipCode.trim())) {
      return { isValid: false, error: 'Invalid ZIP code format. Use 12345 or 12345-6789' };
    }
    
    return { isValid: true };
  }

  static validateState(state: string): { isValid: boolean; error?: string; standardized?: string } {
    const stateUpper = state.trim().toUpperCase();
    
    if (!state.trim()) {
      return { isValid: false, error: 'State is required' };
    }
    
    // Check if it's a valid abbreviation
    if (US_STATES[stateUpper as keyof typeof US_STATES]) {
      return { isValid: true, standardized: stateUpper };
    }
    
    // Check if it's a full state name
    const stateEntry = Object.entries(US_STATES).find(([, fullName]) => 
      fullName.toLowerCase() === state.trim().toLowerCase()
    );
    
    if (stateEntry) {
      return { isValid: true, standardized: stateEntry[0] };
    }
    
    return { isValid: false, error: 'Invalid state. Please use a valid US state or abbreviation' };
  }

  static validateStreetAddress(streetAddress: string): { isValid: boolean; error?: string } {
    if (!streetAddress.trim()) {
      return { isValid: false, error: 'Street address is required' };
    }
    
    if (streetAddress.trim().length < 5) {
      return { isValid: false, error: 'Street address must be at least 5 characters' };
    }
    
    return { isValid: true };
  }

  static validateCity(city: string): { isValid: boolean; error?: string } {
    if (!city.trim()) {
      return { isValid: false, error: 'City is required' };
    }
    
    if (city.trim().length < 2) {
      return { isValid: false, error: 'City name must be at least 2 characters' };
    }
    
    // Basic pattern check - letters, spaces, hyphens, apostrophes
    const cityPattern = /^[a-zA-Z\s\-'\.]+$/;
    if (!cityPattern.test(city.trim())) {
      return { isValid: false, error: 'City name contains invalid characters' };
    }
    
    return { isValid: true };
  }

  static validateCounty(county: string, state?: string): { isValid: boolean; error?: string } {
    if (!county.trim()) {
      return { isValid: false, error: 'County is required' };
    }
    
    if (county.trim().length < 2) {
      return { isValid: false, error: 'County name must be at least 2 characters' };
    }
    
    // Basic pattern check
    const countyPattern = /^[a-zA-Z\s\-'\.]+$/;
    if (!countyPattern.test(county.trim())) {
      return { isValid: false, error: 'County name contains invalid characters' };
    }
    
    return { isValid: true };
  }

  static validateCompleteAddress(address: AddressComponents): ValidationResult {
    const errors: string[] = [];
    const standardizedAddress: AddressComponents = { ...address };

    // Validate each component
    const streetResult = this.validateStreetAddress(address.streetAddress);
    if (!streetResult.isValid) errors.push(streetResult.error!);

    const cityResult = this.validateCity(address.city);
    if (!cityResult.isValid) errors.push(cityResult.error!);

    const stateResult = this.validateState(address.state);
    if (!stateResult.isValid) {
      errors.push(stateResult.error!);
    } else if (stateResult.standardized) {
      standardizedAddress.state = stateResult.standardized;
    }

    const countyResult = this.validateCounty(address.county, address.state);
    if (!countyResult.isValid) errors.push(countyResult.error!);

    const zipResult = this.validateZipCode(address.zipCode);
    if (!zipResult.isValid) errors.push(zipResult.error!);

    return {
      isValid: errors.length === 0,
      errors,
      standardizedAddress: errors.length === 0 ? standardizedAddress : undefined
    };
  }

  static combineAddressComponents(components: AddressComponents): string {
    const { streetAddress, city, state, county, zipCode } = components;
    return [streetAddress, city, state, county, zipCode]
      .filter(component => component && component.trim())
      .join(', ');
  }

  static parseLocationString(location: string): Partial<AddressComponents> {
    if (!location) return {};
    
    const parts = location.split(',').map(part => part.trim());
    const result: Partial<AddressComponents> = {};
    
    if (parts.length >= 5) {
      result.streetAddress = parts[0];
      result.city = parts[1];
      result.state = parts[2];
      result.county = parts[3];
      result.zipCode = parts[4];
    } else if (parts.length === 4) {
      result.streetAddress = parts[0];
      result.city = parts[1];
      result.state = parts[2];
      result.zipCode = parts[3];
    }
    
    return result;
  }
}
