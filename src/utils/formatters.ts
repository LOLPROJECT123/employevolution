
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
  
  // For a real implementation, this would call a geolocation/places API
  // For now, we'll use a larger set of predefined locations
  const allLocations = [
    // Major US cities
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Los Angeles, CA',
    'Chicago, IL', 'Boston, MA', 'Denver, CO', 'Atlanta, GA', 'Dallas, TX', 'Dallas, GA',
    'Houston, TX', 'Phoenix, AZ', 'Portland, OR', 'Miami, FL', 'Nashville, TN', 
    'San Diego, CA', 'San Jose, CA', 'San Antonio, TX', 'Philadelphia, PA', 'Washington, DC',
    'Baltimore, MD', 'Charlotte, NC', 'Columbus, OH', 'Detroit, MI', 'Minneapolis, MN',
    'Las Vegas, NV', 'Pittsburgh, PA', 'St. Louis, MO', 'Cleveland, OH', 'Indianapolis, IN',
    'Orlando, FL', 'Cincinnati, OH', 'Kansas City, MO', 'Tampa, FL', 'Raleigh, NC',
    'Salt Lake City, UT', 'Sacramento, CA', 'Memphis, TN', 'Louisville, KY',
    
    // International cities
    'London, UK', 'Toronto, Canada', 'Berlin, Germany', 'Sydney, Australia', 
    'Tokyo, Japan', 'Singapore', 'Dublin, Ireland', 'Amsterdam, Netherlands',
    'Paris, France', 'Zurich, Switzerland',
    
    // Remote options
    'Remote', 'Remote - US Only', 'Remote - Worldwide', 'Hybrid'
  ];
  
  const inputLower = input.toLowerCase();
  
  // Filter locations that match the input
  const matchingLocations = allLocations.filter(location => 
    location.toLowerCase().includes(inputLower)
  );
  
  // Sort results for better UX - exact matches first, then starts with, then contains
  return matchingLocations.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    // Exact match
    if (aLower === inputLower && bLower !== inputLower) return -1;
    if (bLower === inputLower && aLower !== inputLower) return 1;
    
    // Starts with
    if (aLower.startsWith(inputLower) && !bLower.startsWith(inputLower)) return -1;
    if (bLower.startsWith(inputLower) && !aLower.startsWith(inputLower)) return 1;
    
    return 0;
  }).slice(0, 8); // Limit to top 8 results
};

/**
 * Format a date string relative to current date (e.g., "2 days ago", "Just now")
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  // After 30 days, show month and day
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/**
 * Format a number with thousand separators and optional decimal places
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};
