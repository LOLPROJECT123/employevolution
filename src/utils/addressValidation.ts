
export interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  county: string;
  zipCode: string;
}

export interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  standardizedAddress?: AddressComponents;
}

export interface ZipCodeValidationResult {
  isValid: boolean;
  error?: string;
}

export interface StateValidationResult {
  isValid: boolean;
  error?: string;
  standardized?: string;
}

export class AddressValidator {
  private static readonly US_STATES = {
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

  static validateCompleteAddress(address: AddressComponents): AddressValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!address.streetAddress?.trim()) {
      errors.push('Street address is required');
    }

    if (!address.city?.trim()) {
      errors.push('City is required');
    }

    if (!address.state?.trim()) {
      errors.push('State is required');
    }

    if (!address.zipCode?.trim()) {
      errors.push('ZIP code is required');
    } else if (!/^\d{5}(-\d{4})?$/.test(address.zipCode.trim())) {
      warnings.push('ZIP code format may be invalid (expected: 12345 or 12345-6789)');
    }

    if (!address.county?.trim()) {
      warnings.push('County information helps with better job matching');
    }

    // Create standardized version
    const standardizedAddress: AddressComponents = {
      streetAddress: address.streetAddress?.trim() || '',
      city: this.capitalizeWords(address.city?.trim() || ''),
      state: address.state?.trim().toUpperCase() || '',
      county: this.capitalizeWords(address.county?.trim() || ''),
      zipCode: address.zipCode?.trim() || ''
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      standardizedAddress: errors.length === 0 ? standardizedAddress : undefined
    };
  }

  static validateZipCode(zipCode: string): ZipCodeValidationResult {
    if (!zipCode || !zipCode.trim()) {
      return { isValid: false, error: 'ZIP code is required' };
    }

    const cleanZip = zipCode.trim();
    
    // Check for basic US ZIP code format (12345 or 12345-6789)
    if (!/^\d{5}(-\d{4})?$/.test(cleanZip)) {
      return { isValid: false, error: 'ZIP code must be in format 12345 or 12345-6789' };
    }

    return { isValid: true };
  }

  static validateState(state: string): StateValidationResult {
    if (!state || !state.trim()) {
      return { isValid: false, error: 'State is required' };
    }

    const cleanState = state.trim().toUpperCase();
    
    // Check if it's a valid state abbreviation
    if (this.US_STATES[cleanState as keyof typeof this.US_STATES]) {
      return { isValid: true, standardized: cleanState };
    }

    // Check if it's a full state name and convert to abbreviation
    const stateAbbr = Object.keys(this.US_STATES).find(abbr => 
      this.US_STATES[abbr as keyof typeof this.US_STATES].toUpperCase() === cleanState
    );

    if (stateAbbr) {
      return { isValid: true, standardized: stateAbbr };
    }

    return { isValid: false, error: 'Invalid US state' };
  }

  static parseLocationString(location: string): AddressComponents {
    const parts = location.split(',').map(part => part.trim());
    
    return {
      streetAddress: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
      county: parts[3] || '',
      zipCode: parts[4] || ''
    };
  }

  static combineAddressComponents(address: AddressComponents): string {
    const parts = [
      address.streetAddress,
      address.city,
      address.state,
      address.county,
      address.zipCode
    ].filter(Boolean);

    return parts.join(', ');
  }

  private static capitalizeWords(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
}
