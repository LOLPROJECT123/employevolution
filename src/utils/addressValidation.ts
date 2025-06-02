
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

export class AddressValidator {
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

  private static capitalizeWords(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
}
