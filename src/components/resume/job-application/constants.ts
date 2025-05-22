
export const JOB_TABS = [
  {
    value: 'manual',
    label: 'Manual Apply'
  },
  {
    value: 'auto',
    label: 'Auto Apply'
  },
  {
    value: 'scraper',
    label: 'Job Search'
  },
  {
    value: 'custom-urls',
    label: 'Custom URLs'
  }
];

export const SUPPORTED_JOB_SOURCES = [
  { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/jobs' },
  { id: 'indeed', name: 'Indeed', url: 'https://www.indeed.com' },
  { id: 'glassdoor', name: 'Glassdoor', url: 'https://www.glassdoor.com' },
  { id: 'monster', name: 'Monster', url: 'https://www.monster.com' },
  { id: 'ziprecruiter', name: 'ZipRecruiter', url: 'https://www.ziprecruiter.com' }
];

export const FORM_FIELD_IDENTIFIERS = {
  firstName: ['first name', 'firstname', 'given name', 'first', 'fname'],
  lastName: ['last name', 'lastname', 'surname', 'family name', 'last', 'lname'],
  fullName: ['full name', 'name', 'your name', 'candidate name'],
  email: ['email', 'e-mail', 'email address', 'e-mail address'],
  phone: ['phone', 'telephone', 'mobile', 'cell', 'phone number', 'mobile number'],
  address: ['address', 'street address', 'residential address'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  zipCode: ['zip', 'zipcode', 'zip code', 'postal code', 'postcode'],
  country: ['country', 'nation'],
  linkedin: ['linkedin', 'linkedin url', 'linkedin profile'],
  website: ['website', 'personal website', 'portfolio', 'portfolio url'],
  github: ['github', 'github url', 'github profile'],
  resume: ['resume', 'cv', 'resume upload', 'cv upload', 'upload resume', 'upload cv', 'attach resume', 'attach cv'],
  coverLetter: ['cover letter', 'cover', 'letter', 'motivation letter', 'motivation', 'upload cover letter'],
  salary: ['salary', 'expected salary', 'desired salary', 'salary expectation', 'salary requirement', 'compensation', 'pay'],
  startDate: ['start date', 'available start date', 'availability', 'when can you start'],
  currentCompany: ['current company', 'current employer', 'present company', 'present employer'],
  currentPosition: ['current position', 'current title', 'present position', 'present title'],
  yearsOfExperience: ['years of experience', 'experience', 'work experience', 'total experience'],
  education: ['education', 'highest education', 'degree', 'qualification'],
  workAuthorization: ['work authorization', 'authorized to work', 'work permit', 'visa status', 'visa'],
  citizenship: ['citizenship', 'citizen', 'nationality']
};
