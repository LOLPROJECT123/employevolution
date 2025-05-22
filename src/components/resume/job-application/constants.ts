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

export const SUPPORTED_JOB_SOURCES: JobSource[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://www.linkedin.com/jobs",
    isActive: true
  },
  {
    id: "indeed",
    name: "Indeed",
    url: "https://www.indeed.com",
    isActive: true
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    url: "https://www.glassdoor.com",
    isActive: true
  },
  {
    id: "monster",
    name: "Monster",
    url: "https://www.monster.com",
    isActive: true
  },
  {
    id: "ziprecruiter",
    name: "ZipRecruiter",
    url: "https://www.ziprecruiter.com",
    isActive: true
  }
];

export const FORM_FIELD_IDENTIFIERS = {
  firstName: ['first name', 'given name', 'fname', 'first-name', 'givenname'],
  lastName: ['last name', 'surname', 'lname', 'last-name', 'family name', 'familyname'],
  email: ['email', 'e-mail', 'email address'],
  phone: ['phone', 'telephone', 'phone number', 'mobile', 'cell'],
  address: ['address', 'street address', 'addr'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  zipCode: ['zip', 'zip code', 'postal code', 'postcode', 'postal'],
  country: ['country', 'nation'],
  education: ['education', 'degree', 'school', 'university', 'college', 'academic'],
  workExperience: ['work experience', 'experience', 'employment history', 'work history'],
  resume: ['resume', 'cv', 'curriculum vitae', 'attachment', 'upload']
};
