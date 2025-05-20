
/**
 * Format salary amount with currency symbol and range
 */
export const formatSalary = (min: number, max: number, currency: string = 'USD'): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

  if (min === max) {
    return formatter.format(min);
  }

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  if (min) {
    return `From ${formatter.format(min)}`;
  }

  if (max) {
    return `Up to ${formatter.format(max)}`;
  }

  return 'Not specified';
};

/**
 * Format salary for display in filters
 */
export const formatSalaryCompact = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

/**
 * Get location suggestions based on input text
 */
export const getLocationSuggestions = async (input: string): Promise<string[]> => {
  if (!input || input.length < 2) return [];
  
  // This would typically be an API call to a location service
  // For now, we'll use a simple mock implementation
  const cities = [
    'San Francisco, CA',
    'New York, NY',
    'Seattle, WA',
    'Austin, TX',
    'Los Angeles, CA',
    'Chicago, IL',
    'Boston, MA',
    'Denver, CO',
    'Atlanta, GA',
    'Dallas, TX',
    'Dallas, GA',
    'Houston, TX',
    'Phoenix, AZ',
    'Portland, OR',
    'Miami, FL',
    'Nashville, TN',
    'San Diego, CA',
    'San Jose, CA',
    'San Antonio, TX',
    'Philadelphia, PA'
  ];
  
  const inputLower = input.toLowerCase();
  return cities.filter(city => city.toLowerCase().includes(inputLower)).slice(0, 5);
};
