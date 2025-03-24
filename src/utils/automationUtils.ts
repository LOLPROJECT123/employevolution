
// Modify the user_data section in the getLinkedInAutomationScript function
user_data = {
    "name": "${config.profile.name}",
    "email": "${config.profile.email}",
    "phone": "${config.profile.phone}",
    "location": "${config.profile.location}",
    "years_of_experience": ${config.profile.yearsOfCoding},
    "education": "${config.profile.educationLevel || 'Bachelor\'s Degree'}",
    "skills": ${JSON.stringify(config.profile.codingLanguagesKnown)},
    "work_auth": ${config.profile.workAuthorized || !config.profile.needVisa},
    "need_sponsorship": ${config.profile.needVisa}
}
