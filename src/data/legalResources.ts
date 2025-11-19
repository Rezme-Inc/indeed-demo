/**
 * Fair Chance Hiring Legal Resources by Jurisdiction
 * 
 * This file contains jurisdiction-specific information about Fair Chance Hiring laws,
 * legal resources, government agencies, and contact information for candidates.
 */

export interface LegalResource {
  jurisdiction: string; // State or City
  jurisdictionType: 'state' | 'city' | 'county' | 'federal';
  banTheBoxLaws: {
    name: string;
    enacted?: string;
    summary: string;
    keyProvisions: string[];
    applies_to: string;
  };
  governmentAgencies: {
    name: string;
    phone?: string;
    email?: string;
    website: string;
    filingInfo?: string;
  }[];
  legalAidOrganizations: {
    name: string;
    phone?: string;
    email?: string;
    website: string;
    services: string;
  }[];
  resources: {
    title: string;
    url: string;
    description: string;
  }[];
  timelines: {
    backgroundCheckNotice?: string;
    adverseActionNotice?: string;
    rightToRespond?: string;
  };
}

export const legalResourcesData: LegalResource[] = [
  // CALIFORNIA
  {
    jurisdiction: 'California',
    jurisdictionType: 'state',
    banTheBoxLaws: {
      name: 'California Fair Chance Act (AB 1008)',
      enacted: '2018',
      summary: 'Prohibits employers with 5 or more employees from asking about criminal history before making a conditional job offer.',
      keyProvisions: [
        'Employers cannot inquire about criminal history on job applications',
        'Employers must conduct individualized assessment before denying employment based on criminal history',
        'Candidates must receive written notice before adverse action',
        'Candidates have right to respond with mitigating information',
        'Employers cannot inquire about or consider arrests not resulting in conviction, referral to diversion, or convictions that have been sealed, dismissed, or expunged'
      ],
      applies_to: 'Employers with 5 or more employees'
    },
    governmentAgencies: [
      {
        name: 'California Civil Rights Department (CRD)',
        phone: '800-884-1684',
        website: 'https://calcivilrights.ca.gov/',
        filingInfo: 'File a complaint online or by phone. Complaints must be filed within 1 year of discrimination.'
      },
      {
        name: 'California Labor Commissioner\'s Office',
        phone: '833-526-4636',
        website: 'https://www.dir.ca.gov/dlse/',
        filingInfo: 'Handles wage and hour complaints related to employment discrimination'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Legal Aid at Work',
        phone: '415-864-8848',
        website: 'https://legalaidatwork.org/',
        services: 'Free legal advice and representation for employment discrimination cases'
      },
      {
        name: 'Root & Rebound',
        phone: '510-279-4662',
        website: 'https://www.rootandrebound.org/',
        email: 'info@rootandrebound.org',
        services: 'Legal services for people with criminal records, including employment rights'
      },
      {
        name: 'All of Us or None',
        website: 'https://www.prisonerswithchildren.org/',
        phone: '415-255-7036',
        services: 'Advocacy and support for people with convictions, including employment rights'
      }
    ],
    resources: [
      {
        title: 'California Fair Chance Act - Official Text',
        url: 'https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=201720180AB1008',
        description: 'Full text of AB 1008 - California Fair Chance Act'
      },
      {
        title: 'Know Your Rights: Fair Chance Act',
        url: 'https://www.dir.ca.gov/dlse/FairChanceAct.pdf',
        description: 'Employee rights under California Fair Chance Act (PDF)'
      },
      {
        title: 'File a Complaint with CRD',
        url: 'https://calcivilrights.ca.gov/complaintprocess/',
        description: 'How to file a discrimination complaint in California'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Employer must provide copy of background check before taking adverse action',
      adverseActionNotice: 'Employer must provide written notice with specific reasons and opportunity to respond',
      rightToRespond: '5 business days minimum to respond with mitigating information'
    }
  },

  // LOS ANGELES
  {
    jurisdiction: 'Los Angeles',
    jurisdictionType: 'city',
    banTheBoxLaws: {
      name: 'Los Angeles Fair Chance Initiative for Hiring (FCIH)',
      enacted: '2017',
      summary: 'City contractors and employers with 10+ employees cannot ask about criminal history until after conditional offer.',
      keyProvisions: [
        'Applies to all city contractors and private employers with 10 or more employees',
        'Cannot inquire about criminal history until after conditional offer',
        'Must conduct individualized assessment',
        'Must provide notice and opportunity to respond before adverse action',
        'Cannot consider arrests not resulting in conviction or convictions more than 7 years old (with exceptions)'
      ],
      applies_to: 'City contractors and private employers with 10+ employees'
    },
    governmentAgencies: [
      {
        name: 'Los Angeles Department of Public Works - Bureau of Contract Administration',
        phone: '213-847-2625',
        website: 'https://bca.lacity.org/',
        filingInfo: 'For violations by city contractors'
      },
      {
        name: 'California Civil Rights Department - Los Angeles Office',
        phone: '213-439-6799',
        website: 'https://calcivilrights.ca.gov/',
        filingInfo: 'For private employer violations'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Legal Aid Foundation of Los Angeles (LAFLA)',
        phone: '800-399-4529',
        website: 'https://lafla.org/',
        services: 'Free legal services for low-income LA County residents'
      },
      {
        name: 'Bet Tzedek Legal Services',
        phone: '323-939-0506',
        website: 'https://www.bettzedek.org/',
        services: 'Free legal services including employment discrimination'
      },
      {
        name: 'A New Way of Life Reentry Project',
        phone: '323-563-3575',
        website: 'https://anewwayoflife.org/',
        services: 'Support and legal assistance for formerly incarcerated women'
      }
    ],
    resources: [
      {
        title: 'LA Fair Chance Initiative - Official Information',
        url: 'https://bca.lacity.org/fair-chance-initiative-hiring-ordinance',
        description: 'Official information about LA\'s Fair Chance ordinance'
      },
      {
        title: 'Know Your Rights in Los Angeles',
        url: 'https://wagesla.lacity.org/fair-chance-initiative-for-hiring',
        description: 'Employee rights under LA Fair Chance law'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Must provide background check copy before adverse action',
      adverseActionNotice: 'Must provide written preliminary notice',
      rightToRespond: '5 business days to respond before final decision'
    }
  },

  // SAN FRANCISCO
  {
    jurisdiction: 'San Francisco',
    jurisdictionType: 'city',
    banTheBoxLaws: {
      name: 'San Francisco Fair Chance Ordinance',
      enacted: '2014',
      summary: 'One of the strongest Fair Chance laws - prohibits criminal history inquiries until conditional offer for most employers.',
      keyProvisions: [
        'Applies to all employers with 5 or more employees (including part-time)',
        'Cannot inquire about criminal history until after conditional offer',
        'Must conduct individualized assessment using specific factors',
        'Cannot consider arrests not resulting in conviction',
        'Cannot consider convictions that have been dismissed, expunged, or are more than 7 years old',
        'Cannot consider marijuana convictions more than 2 years old',
        'Detailed adverse action notice requirements'
      ],
      applies_to: 'All employers with 5+ employees in San Francisco'
    },
    governmentAgencies: [
      {
        name: 'San Francisco Office of Labor Standards Enforcement (OLSE)',
        phone: '415-554-6292',
        email: 'olse@sfgov.org',
        website: 'https://sfgov.org/olse/',
        filingInfo: 'File complaint online, by phone, or in person. OLSE investigates violations and can impose penalties.'
      },
      {
        name: 'San Francisco Human Rights Commission',
        phone: '415-252-2500',
        website: 'https://sf.gov/departments/human-rights-commission',
        filingInfo: 'Handles discrimination complaints and provides mediation services'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Legal Aid at Work',
        phone: '415-864-8848',
        website: 'https://legalaidatwork.org/',
        email: 'info@legalaidatwork.org',
        services: 'Free advice and representation for employment rights violations'
      },
      {
        name: 'Bay Area Legal Aid',
        phone: '800-551-5554',
        website: 'https://baylegal.org/',
        services: 'Free civil legal services including employment law'
      },
      {
        name: 'Root & Rebound',
        phone: '510-279-4662',
        website: 'https://www.rootandrebound.org/',
        services: 'Specializes in reentry legal issues including employment rights'
      }
    ],
    resources: [
      {
        title: 'SF Fair Chance Ordinance - Full Text',
        url: 'https://codelibrary.amlegal.com/codes/san_francisco/latest/sf_police/0-0-0-45793',
        description: 'Official text of San Francisco\'s Fair Chance Ordinance'
      },
      {
        title: 'Employer and Employee Guide',
        url: 'https://sfgov.org/olse/fair-chance-ordinance-fco',
        description: 'OLSE guide to Fair Chance rights and requirements'
      },
      {
        title: 'File a Fair Chance Complaint',
        url: 'https://sfgov.org/olse/file-complaint',
        description: 'How to file a complaint with SF Office of Labor Standards'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Must provide background check copy and SF FCO notice',
      adverseActionNotice: 'Must provide detailed written notice including individualized assessment',
      rightToRespond: '7 business days to respond with evidence and explanations'
    }
  },

  // SAN DIEGO COUNTY
  {
    jurisdiction: 'San Diego',
    jurisdictionType: 'county',
    banTheBoxLaws: {
      name: 'San Diego County Fair Chance Ordinance',
      enacted: 'September 10, 2024 (Effective October 10, 2024 - Penalties begin July 1, 2025)',
      summary: 'Works in conjunction with the California Fair Chance Act to clarify candidates\' rights, introduce additional compliance requirements, and improve enforcement through the Office of Labor Standards and Enforcement (OLSE).',
      keyProvisions: [
        'Enforced by County Office of Labor Standards and Enforcement (OLSE)',
        'Streamlined complaint process - workers can contact OLSE directly instead of the State',
        'OLSE conducts education and outreach to workers and employers across unincorporated San Diego County',
        'OLSE investigates claims from justice-involved job seekers who believe employer violated Fair Chance Act',
        'Supports employers in correcting hiring processes that violate the law',
        'Administrative penalties starting July 1, 2025: First violation up to $5,000, second up to $10,000, third and subsequent up to $20,000',
        'At least half of penalties collected awarded to aggrieved candidates',
        'Complaints must be filed within one year of alleged violation',
        'OLSE provides appeal process with County hearing officer'
      ],
      applies_to: 'Employers with 5 or more employees in unincorporated San Diego County (works with California Fair Chance Act)'
    },
    governmentAgencies: [
      {
        name: 'San Diego County Office of Labor Standards and Enforcement (OLSE)',
        phone: '619-531-5129',
        email: 'olse@sdcounty.ca.gov',
        website: 'https://www.sandiegocounty.gov/content/sdc/OLSE/fair-chance.html',
        filingInfo: 'File complaint within 1 year via email, phone, or in person at County Administration Center. Open Monday-Friday 8:00am-5:00pm. Staff available in Spanish and English with interpretation for other languages. For business consultation: Contact Mikey Knab at Michael.knab@sdcounty.ca.gov or 619-490-0366'
      },
      {
        name: 'California Civil Rights Department (CRD)',
        phone: '800-884-1684',
        website: 'https://calcivilrights.ca.gov/',
        filingInfo: 'For violations of California Fair Chance Act statewide. File complaint within 1 year of discrimination.'
      },
      {
        name: 'Employee Rights Center (ERC)',
        website: 'https://employeerightscenters.org/',
        filingInfo: 'Partner organization that supports workers, especially disadvantaged workers without union representation, providing education on workplace, health, and immigration issues.'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Legal Aid Society of San Diego',
        phone: '877-534-2524',
        website: 'https://www.lassd.org/',
        email: 'info@lassd.org',
        services: 'Free legal services for low-income San Diego County residents, including employment discrimination'
      },
      {
        name: 'San Diego Volunteer Lawyer Program',
        phone: '619-531-3513',
        website: 'https://www.sdvlp.org/',
        services: 'Free legal assistance for civil matters including employment issues'
      },
      {
        name: 'Center for Employment Opportunities (CEO)',
        phone: '619-398-2332',
        website: 'https://ceoworks.org/',
        services: 'Employment services and advocacy for people with criminal records - OLSE referral partner'
      },
      {
        name: 'San Diego Workforce Partnership - Second Chance Program',
        phone: '619-228-2900',
        website: 'https://workforce.org/',
        services: 'Employment resources and support for job seekers with barriers to employment - OLSE referral partner'
      }
    ],
    resources: [
      {
        title: 'San Diego County Fair Chance Ordinance - Official Page',
        url: 'https://www.sandiegocounty.gov/content/sdc/OLSE/fair-chance.html',
        description: 'Official OLSE page with ordinance information, complaint process, and employer toolkit'
      },
      {
        title: 'San Diego County Fair Chance Hiring Toolkit',
        url: 'https://www.sandiegocounty.gov/content/sdc/OLSE/fair-chance.html',
        description: 'Employer toolkit with sample documents: compliance statement, conditional offer letter, assessment forms, and notices'
      },
      {
        title: 'File a Fair Chance Complaint with OLSE',
        url: 'https://www.sandiegocounty.gov/content/sdc/OLSE/fair-chance.html',
        description: 'Complete the inquiry form to file a complaint or contact OLSE directly'
      },
      {
        title: 'Board Letter and Ordinance (September 10, 2024)',
        url: 'https://www.sandiegocounty.gov/content/sdc/OLSE/fair-chance.html',
        description: 'Official Board of Supervisors letter, ordinance text, and presentation materials'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Must follow California Fair Chance Act requirements for background check disclosure',
      adverseActionNotice: 'Must provide written notice before revoking job offer due to conviction history',
      rightToRespond: 'Reasonable time to respond as required by California Fair Chance Act (typically 5+ business days)'
    }
  },

  // SEATTLE
  {
    jurisdiction: 'Seattle',
    jurisdictionType: 'city',
    banTheBoxLaws: {
      name: 'Seattle Fair Chance Employment Ordinance (SMC 14.17)',
      enacted: '2018',
      summary: 'The Fair Chance Employment Ordinance ensures that qualified job seekers have a fair chance at employment regardless of their criminal record. Helps individuals leaving the justice system strengthen the community.',
      keyProvisions: [
        'Applies to employers with 5 or more employees in Seattle',
        'Cannot inquire about criminal history on job applications',
        'For salary positions: Cannot ask until conditional job offer is made',
        'For hourly non-management positions: Cannot ask until first interview',
        'Must conduct individualized assessment considering nature of offense, time passed, and job duties',
        'Cannot consider arrests without conviction, juvenile records, or vacated/expunged convictions',
        'Must provide written notice before adverse action with specific reasons',
        'Candidate has at least 7 business days to respond with mitigating information',
        'Private right of action - employees can sue for violations',
        'Enforced by Seattle Office of Labor Standards'
      ],
      applies_to: 'Employers with 5 or more employees in Seattle'
    },
    governmentAgencies: [
      {
        name: 'Seattle Office of Labor Standards (OLS)',
        phone: '206-256-5297',
        email: 'laborstandards@seattle.gov',
        website: 'https://www.seattle.gov/laborstandards/ordinances/fair-chance-employment',
        filingInfo: 'File complaint with OLS within 180 days of violation. OLS investigates and enforces the Fair Chance Employment Ordinance. Available by phone, email, or online complaint form.'
      },
      {
        name: 'Washington State Attorney General - Civil Rights Division',
        phone: '833-660-4877',
        email: 'fairchancejobs@atg.wa.gov',
        website: 'https://www.atg.wa.gov/fair-chance-act',
        filingInfo: 'For violations of Washington State Fair Chance Act'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Columbia Legal Services',
        phone: '206-464-5911',
        website: 'https://columbialegal.org/',
        services: 'Free civil legal aid for low-income Washington residents, including employment discrimination'
      },
      {
        name: 'Northwest Justice Project',
        phone: '888-201-1014',
        website: 'https://nwjustice.org/',
        services: 'Free legal services for low-income people in Washington State, including employment issues'
      },
      {
        name: 'TeamChild',
        phone: '206-322-2444',
        website: 'https://teamchild.org/',
        services: 'Legal services for youth with criminal records, including employment rights and record sealing'
      },
      {
        name: 'Pioneer Human Services',
        phone: '206-768-7100',
        website: 'https://pioneerhumanservices.org/',
        services: 'Employment services and support for people with criminal backgrounds'
      }
    ],
    resources: [
      {
        title: 'Seattle Fair Chance Employment Ordinance - Official Page',
        url: 'https://www.seattle.gov/laborstandards/ordinances/fair-chance-employment',
        description: 'Official Seattle OLS page with ordinance information, employee rights, and employer guidance'
      },
      {
        title: 'Know Your Rights - Fair Chance Employment',
        url: 'https://www.seattle.gov/laborstandards/ordinances/fair-chance-employment',
        description: 'Information for employees about their rights under the Fair Chance Employment Ordinance'
      },
      {
        title: 'File a Fair Chance Complaint with OLS',
        url: 'https://www.seattle.gov/laborstandards/ordinances/fair-chance-employment',
        description: 'How to file a complaint with Seattle Office of Labor Standards'
      },
      {
        title: 'Employer Resources and Compliance Guide',
        url: 'https://www.seattle.gov/laborstandards/ordinances/fair-chance-employment',
        description: 'Guidance for employers on compliance with the Fair Chance Employment Ordinance'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Must provide copy of background check before adverse action',
      adverseActionNotice: 'Must provide written notice with specific reasons for denial based on criminal history',
      rightToRespond: 'At least 7 business days to respond with mitigating information before final decision'
    }
  },

  // WASHINGTON STATE
  {
    jurisdiction: 'Washington',
    jurisdictionType: 'state',
    banTheBoxLaws: {
      name: 'Washington Fair Chance Act (RCW Chapter 49.94)',
      enacted: '2018',
      summary: 'Protects job applicants with criminal records so they may fairly compete for jobs for which they are otherwise qualified. Prohibits criminal history inquiries until after determining the applicant is otherwise qualified.',
      keyProvisions: [
        'Applies to ALL employers in Washington State (regardless of number of employees)',
        'Job advertisements cannot exclude people with criminal records (no "no felons" or similar language)',
        'Job applications cannot include any questions about criminal history',
        'Cannot inquire about criminal history until AFTER initially determining applicant is otherwise qualified',
        'Cannot conduct background checks until after determining applicant is otherwise qualified',
        'Cannot obtain criminal record information until after determining applicant is otherwise qualified',
        'Cannot implement policies that automatically or categorically exclude applicants with criminal records',
        'Cannot reject applicants for failure to disclose criminal history',
        'Anyone can file a complaint - not just affected job applicants',
        'Exemptions: positions with unsupervised access to children/vulnerable adults, law enforcement, financial institutions'
      ],
      applies_to: 'All employers in Washington State (public agencies, private businesses, contractors, temp agencies, training programs, etc.)'
    },
    governmentAgencies: [
      {
        name: 'Washington State Attorney General - Civil Rights Division',
        phone: '833-660-4877',
        email: 'fairchancejobs@atg.wa.gov',
        website: 'https://www.atg.wa.gov/fair-chance-act',
        filingInfo: 'The Civil Rights Division accepts complaints about unlawful use of criminal record information. File online, by email at fairchancejobs@atg.wa.gov, or call toll-free (833) 660-4877. Anyone can file - not just affected applicants.'
      },
      {
        name: 'Washington State Human Rights Commission',
        phone: '800-233-3247',
        website: 'https://www.hum.wa.gov/',
        filingInfo: 'For other employment discrimination complaints. File within 6 months of violation.'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Columbia Legal Services',
        phone: '206-464-5911',
        website: 'https://columbialegal.org/',
        services: 'Free civil legal aid for low-income Washington residents across the state'
      },
      {
        name: 'Northwest Justice Project',
        phone: '888-201-1014',
        website: 'https://nwjustice.org/',
        services: 'Statewide free legal services for low-income Washingtonians'
      },
      {
        name: 'Washington Defender Association',
        phone: '206-623-4321',
        website: 'https://www.defensenet.org/',
        services: 'Resources and advocacy for people with criminal records, including employment rights'
      }
    ],
    resources: [
      {
        title: 'Washington Fair Chance Act - Official Attorney General Page',
        url: 'https://www.atg.wa.gov/fair-chance-act',
        description: 'Official information, FAQs, and complaint process from WA Attorney General'
      },
      {
        title: 'Fair Chance Act Employee Rights (English & Spanish PDFs)',
        url: 'https://www.atg.wa.gov/fair-chance-act',
        description: 'Know Your Rights fact sheets in English and Español available for download'
      },
      {
        title: 'File a Fair Chance Complaint Online',
        url: 'https://www.atg.wa.gov/fair-chance-act',
        description: 'Submit a complaint using the online form - Civil Rights Division will follow up'
      },
      {
        title: 'RCW Chapter 49.94 - Full Text of Law',
        url: 'https://app.leg.wa.gov/RCW/default.aspx?cite=49.94',
        description: 'Complete text of Washington Fair Chance Act legislation'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Cannot conduct background check until after determining applicant is otherwise qualified for the position',
      adverseActionNotice: 'Must notify applicant if criminal record information will be used to disqualify them',
      rightToRespond: 'Reasonable opportunity to respond to criminal record findings'
    }
  },

  // NEW YORK CITY
  {
    jurisdiction: 'New York City',
    jurisdictionType: 'city',
    banTheBoxLaws: {
      name: 'NYC Fair Chance Act (Local Law 63 of 2015, Amended by Local Law 4 of 2021)',
      enacted: '2015 (Amended 2021 - Effective July 29, 2021)',
      summary: 'NYC Human Rights Law prohibits employment discrimination based on criminal history. The Fair Chance Act makes it unlawful for most employers to inquire about criminal history before extending a conditional job offer. Applies to all five boroughs: Manhattan, Brooklyn, Queens, Bronx, and Staten Island.',
      keyProvisions: [
        'Applies to employers with 4 or more employees in NYC (all five boroughs)',
        'Cannot ask about criminal history on applications or during interviews',
        'Can only inquire about criminal history AFTER extending conditional offer of employment',
        'Cannot ever inquire about sealed cases, cases adjourned in contemplation of dismissal (ACDs), youthful offender adjudications, or cases dismissed in person\'s favor',
        'Cannot consider unsealed violations or unsealed non-criminal offenses',
        'Protections extend to current employees and pending cases (as of 2021)',
        'Must conduct "Fair Chance Analysis" using Article 23-A factors before withdrawing offer',
        'Must provide written copy of Fair Chance Analysis and give applicant at least 3 business days to respond',
        'Protections apply to interns, freelancers, and independent contractors',
        'Enforced by NYC Commission on Human Rights with civil penalties'
      ],
      applies_to: 'All employers with 4+ employees in New York City (Manhattan, Brooklyn, Queens, Bronx, Staten Island)'
    },
    governmentAgencies: [
      {
        name: 'NYC Commission on Human Rights (CCHR)',
        phone: '212-416-0197',
        website: 'https://www.nyc.gov/site/cchr/',
        filingInfo: 'File complaint within 1 year of discriminatory act (or 3 years for gender-based harassment). Call 311 or 212-416-0197. Can also file in NY State Supreme Court within 3 years.'
      },
      {
        name: 'New York State Division of Human Rights',
        phone: '888-392-3644',
        website: 'https://dhr.ny.gov/',
        filingInfo: 'Shares enforcement authority over Article 23-A with NYC Commission on Human Rights'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'The Legal Aid Society - Employment Law Unit',
        phone: '212-577-3300',
        website: 'https://legalaidnyc.org/',
        services: 'Free legal services for low-income New Yorkers facing employment discrimination'
      },
      {
        name: 'Legal Action Center',
        phone: '212-243-1313',
        website: 'https://lac.org/',
        services: 'Specializes in discrimination against people with criminal records and substance use histories'
      },
      {
        name: 'Urban Justice Center',
        phone: '646-602-5600',
        website: 'https://www.urbanjustice.org/',
        services: 'Legal services for vulnerable populations including those with criminal records'
      },
      {
        name: 'Brooklyn Defender Services',
        phone: '718-254-0700',
        website: 'https://www.bds.org/',
        services: 'Criminal defense and civil legal services including employment rights'
      },
      {
        name: 'Fortune Society',
        phone: '212-691-7554',
        website: 'https://fortunesociety.org/',
        services: 'Support and advocacy for people with criminal records, including employment services'
      }
    ],
    resources: [
      {
        title: 'NYC Fair Chance Act - Official CCHR Guidance',
        url: 'https://www.nyc.gov/site/cchr/law/fair-chance-act.page',
        description: 'Comprehensive legal enforcement guidance from NYC Commission on Human Rights'
      },
      {
        title: 'Know Your Rights: Fair Chance Act',
        url: 'https://www.nyc.gov/site/cchr/law/fair-chance-act.page',
        description: 'Employee rights under NYC Fair Chance Act and criminal history protections'
      },
      {
        title: 'File a Complaint with NYC Commission on Human Rights',
        url: 'https://www.nyc.gov/site/cchr/about/report-discrimination.page',
        description: 'How to file a discrimination complaint with CCHR - online or by phone'
      },
      {
        title: 'NYC Human Rights Law - Full Text',
        url: 'https://www.nyc.gov/site/cchr/law/the-law.page',
        description: 'Complete text of NYC Human Rights Law including Fair Chance Act provisions'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Cannot inquire about criminal history until AFTER conditional offer of employment',
      adverseActionNotice: 'Must provide written Fair Chance Analysis before withdrawing conditional offer',
      rightToRespond: 'At least 3 business days to respond to Fair Chance Analysis with additional information or explanation'
    }
  },

  // NEW YORK STATE
  {
    jurisdiction: 'New York',
    jurisdictionType: 'state',
    banTheBoxLaws: {
      name: 'New York Correction Law Article 23-A',
      enacted: '1976 (amended 2008)',
      summary: 'Prohibits employers from denying employment based solely on criminal conviction without conducting case-by-case analysis.',
      keyProvisions: [
        'Employers must consider 8 specific factors before denying employment based on criminal history',
        'Cannot deny employment unless there is direct relationship between conviction and job, or unreasonable risk',
        'Must provide written notice if denying employment due to criminal history',
        'Candidate has right to respond within 5 business days',
        'Applies to all employers in New York State'
      ],
      applies_to: 'All employers in New York State'
    },
    governmentAgencies: [
      {
        name: 'New York State Division of Human Rights',
        phone: '888-392-3644',
        website: 'https://dhr.ny.gov/',
        filingInfo: 'File complaint within 1 year of discrimination. Available online or by mail.'
      },
      {
        name: 'New York State Department of Labor',
        phone: '888-469-7365',
        website: 'https://dol.ny.gov/',
        filingInfo: 'Handles employment-related complaints and violations'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Legal Action Center',
        phone: '212-243-1313',
        website: 'https://lac.org/',
        services: 'Specializes in discrimination against people with criminal records and substance use histories'
      },
      {
        name: 'The Legal Aid Society - Employment Law Unit',
        phone: '212-577-3300',
        website: 'https://legalaidnyc.org/',
        services: 'Free legal services for low-income New Yorkers facing employment discrimination'
      },
      {
        name: 'Urban Justice Center',
        phone: '646-602-5600',
        website: 'https://www.urbanjustice.org/',
        services: 'Legal services for vulnerable populations including those with criminal records'
      }
    ],
    resources: [
      {
        title: 'NY Correction Law Article 23-A',
        url: 'https://www.nysenate.gov/legislation/laws/COR/A23-A',
        description: 'Full text of New York\'s fair chance employment law'
      },
      {
        title: 'Know Your Rights - Criminal Records',
        url: 'https://dhr.ny.gov/criminal-history',
        description: 'NY Division of Human Rights guide on criminal record discrimination'
      },
      {
        title: 'File a Complaint',
        url: 'https://dhr.ny.gov/complaint',
        description: 'How to file discrimination complaint with NY DHR'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Must provide copy of evaluation and Article 23-A analysis',
      adverseActionNotice: 'Must provide written notice stating reason based on Article 23-A factors',
      rightToRespond: '5 business days to provide explanation or evidence'
    }
  },

  // FEDERAL (Applies to all jurisdictions)
  {
    jurisdiction: 'Federal',
    jurisdictionType: 'federal',
    banTheBoxLaws: {
      name: 'EEOC Guidance on Criminal Records',
      enacted: '2012',
      summary: 'Federal guidance prohibiting blanket exclusions based on criminal history as potential Title VII violation.',
      keyProvisions: [
        'Blanket policies excluding people with criminal records may violate Title VII',
        'Employers should consider: nature of crime, time passed, nature of job',
        'Employers must show business necessity for excluding based on criminal history',
        'Individualized assessment recommended',
        'Applies to employers with 15 or more employees'
      ],
      applies_to: 'Employers with 15+ employees nationwide'
    },
    governmentAgencies: [
      {
        name: 'Equal Employment Opportunity Commission (EEOC)',
        phone: '800-669-4000',
        website: 'https://www.eeoc.gov/',
        filingInfo: 'File charge within 180 days (300 days in some states). Can file online or at local EEOC office.'
      },
      {
        name: 'Department of Justice - Civil Rights Division',
        phone: '202-514-4609',
        website: 'https://www.justice.gov/crt',
        filingInfo: 'Handles pattern or practice discrimination cases'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'National Employment Law Project (NELP)',
        website: 'https://www.nelp.org/',
        services: 'Advocacy and resources on fair chance hiring nationwide'
      },
      {
        name: 'National H.I.R.E. Network',
        website: 'https://hirenetwork.org/',
        email: 'info@hirenetwork.org',
        services: 'Resources and legal information for people with criminal records'
      }
    ],
    resources: [
      {
        title: 'EEOC Enforcement Guidance on Criminal Records',
        url: 'https://www.eeoc.gov/laws/guidance/enforcement-guidance-consideration-arrest-and-conviction-records-employment',
        description: 'Official EEOC guidance on use of criminal records in employment'
      },
      {
        title: 'File a Charge of Discrimination',
        url: 'https://www.eeoc.gov/filing-charge-discrimination',
        description: 'How to file an EEOC charge'
      },
      {
        title: 'Know Your Rights: Background Checks',
        url: 'https://www.eeoc.gov/youth/background-checks-what-employees-should-know',
        description: 'Employee rights regarding criminal background checks'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Under FCRA, must provide background check copy before adverse action',
      adverseActionNotice: 'Must provide pre-adverse and final adverse action notices under FCRA',
      rightToRespond: 'Reasonable time to respond to pre-adverse action notice (typically 5-7 days)'
    }
  },

  // CHICAGO
  {
    jurisdiction: 'Chicago',
    jurisdictionType: 'city',
    banTheBoxLaws: {
      name: 'Chicago Fair Chance Ordinance (Municipal Code Section 6-10-054)',
      enacted: '2014',
      summary: 'The Chicago Human Rights Ordinance prohibits discrimination based on criminal history in employment, public accommodations, and credit transactions. Enforced by the Chicago Commission on Human Relations.',
      keyProvisions: [
        'Applies to all employers in Chicago',
        'Cannot inquire about criminal history on job applications',
        'Cannot inquire about criminal history until after initial interview or conditional offer',
        'Must conduct individualized assessment considering nature of offense, time passed, and job duties',
        'Cannot consider arrests without conviction, sealed/expunged records',
        'Protected classes include criminal record or criminal history (as defined in Section 6-10-054)',
        'Enforced by Chicago Commission on Human Relations with investigation and adjudication powers',
        'Commission can impose fines and other remedies for violations'
      ],
      applies_to: 'All employers in the City of Chicago'
    },
    governmentAgencies: [
      {
        name: 'Chicago Commission on Human Relations (CCHR)',
        phone: '312-744-4610',
        email: 'cchr@cityofchicago.org',
        website: 'https://www.chicago.gov/city/en/depts/cchr.html',
        filingInfo: 'File discrimination complaint with CCHR within 180 days (extended to 300 days during pandemic). CCHR investigates and adjudicates complaints. Available by phone, email, or online complaint form.'
      },
      {
        name: 'Illinois Department of Labor - Ban the Box',
        phone: '312-793-7191',
        email: 'DOL.BTB@Illinois.gov',
        website: 'https://labor.illinois.gov/laws-rules/fls/job-opportunities-for-qualified-applicants-act.html',
        filingInfo: 'For violations of Illinois state Ban the Box law (JFOQA)'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Cabrini Green Legal Aid',
        phone: '312-738-2452',
        website: 'https://www.cgla.net/',
        services: 'Free legal services for criminal record-related employment discrimination in Chicago'
      },
      {
        name: 'Legal Council for Health Justice',
        phone: '312-605-1957',
        website: 'https://www.legalcouncil.org/',
        services: 'Free legal assistance for low-income Chicago residents including employment rights'
      },
      {
        name: 'Chicago Lawyers\' Committee for Civil Rights',
        phone: '312-630-9744',
        website: 'https://www.clccrul.org/',
        services: 'Legal assistance for civil rights violations including employment discrimination'
      },
      {
        name: 'Safer Foundation',
        phone: '312-922-2200',
        website: 'https://saferfoundation.org/',
        services: 'Employment services and advocacy for people with criminal records in Chicago area'
      }
    ],
    resources: [
      {
        title: 'Chicago Human Rights Ordinance - Criminal History Protection',
        url: 'https://www.chicago.gov/city/en/depts/cchr.html',
        description: 'Official CCHR page with information on criminal history discrimination protections'
      },
      {
        title: 'File a Discrimination Complaint with CCHR',
        url: 'https://www.chicago.gov/city/en/depts/cchr/provdrs/civil_rightscomplaints.html',
        description: 'How to file a complaint with Chicago Commission on Human Relations'
      },
      {
        title: 'Chicago Municipal Code - Human Rights Ordinance',
        url: 'https://codelibrary.amlegal.com/codes/chicago/latest/chicago_il/0-0-0-2619517',
        description: 'Full text of Chicago Human Rights Ordinance including Fair Chance provisions'
      },
      {
        title: 'CCHR Ordinance Booklet (PDF)',
        url: 'https://www.chicago.gov/content/dam/city/depts/cchr/AdjSupportingInfo/AdjFORMS/2023AdjudicationForms/Ordinance%20Booklet%2005.24.2023.pdf',
        description: 'Official booklet with Chicago Fair Housing, Human Rights, and Commission ordinances'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Cannot inquire about criminal history on applications or until after initial interview/conditional offer',
      adverseActionNotice: 'Must provide written notice if denying employment based on criminal history with opportunity for individualized assessment',
      rightToRespond: 'Reasonable opportunity to respond with mitigating information (typically 5-7 business days)'
    }
  },

  // ILLINOIS
  {
    jurisdiction: 'Illinois',
    jurisdictionType: 'state',
    banTheBoxLaws: {
      name: 'Illinois Job Opportunities for Qualified Applicants Act (820 ILCS 75)',
      enacted: '2021',
      summary: 'An employer or employment agency may not inquire about or into, consider, or require disclosure of criminal records until the applicant has been determined qualified for the position and selected for an interview or, if there is no interview, until after a conditional offer of employment.',
      keyProvisions: [
        'Employers cannot ask about criminal history on applications',
        'Cannot inquire about criminal records until applicant is determined qualified AND selected for interview',
        'If no interview: cannot inquire until after conditional offer of employment',
        'Must conduct individualized assessment',
        'Cannot consider arrests not resulting in conviction, expunged or sealed records',
        'Employers may notify applicants in writing of specific offenses that disqualify from employment due to law or policy',
        'Exemptions: positions where federal/state law requires exclusion, positions requiring fidelity bonds, EMS positions'
      ],
      applies_to: 'All private employers with 15+ employees and one employee working in Illinois'
    },
    governmentAgencies: [
      {
        name: 'Illinois Department of Labor - Fair Labor Standards Division',
        phone: '312-793-7191',
        email: 'DOL.BTB@Illinois.gov',
        website: 'https://labor.illinois.gov/laws-rules/fls/job-opportunities-for-qualified-applicants-act.html',
        filingInfo: 'File complaint with Illinois Department of Labor. Contact Ban the Box unit at (312) 793-7191 or DOL.BTB@Illinois.gov. Complaint form available online.'
      },
      {
        name: 'Illinois Department of Human Rights',
        phone: '312-814-6200',
        website: 'https://www2.illinois.gov/dhr',
        filingInfo: 'For broader employment discrimination complaints, file within 300 days'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Cabrini Green Legal Aid',
        phone: '312-738-2452',
        website: 'https://www.cgla.net/',
        services: 'Free legal services for criminal record-related employment issues'
      },
      {
        name: 'Legal Council for Health Justice',
        phone: '312-605-1957',
        website: 'https://www.legalcouncil.org/',
        services: 'Free legal assistance for low-income individuals including employment rights'
      },
      {
        name: 'Chicago Lawyers\' Committee for Civil Rights',
        phone: '312-630-9744',
        website: 'https://www.clccrul.org/',
        services: 'Legal assistance for civil rights violations including employment discrimination'
      }
    ],
    resources: [
      {
        title: 'Illinois Job Opportunities for Qualified Applicants Act - Official Page',
        url: 'https://labor.illinois.gov/laws-rules/fls/job-opportunities-for-qualified-applicants-act.html',
        description: 'Official Illinois Department of Labor page with law summary and contact information'
      },
      {
        title: 'Full Text of the Law (820 ILCS 75)',
        url: 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=3895',
        description: 'Complete text of Illinois Job Opportunities for Qualified Applicants Act'
      },
      {
        title: 'File a Ban the Box Complaint',
        url: 'https://labor.illinois.gov/laws-rules/fls/job-opportunities-for-qualified-applicants-act.html',
        description: 'Complaint form and filing instructions for JFOQA violations'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Cannot inquire about criminal history until applicant determined qualified and selected for interview (or after conditional offer if no interview)',
      adverseActionNotice: 'Must provide notice if denying employment based on criminal history',
      rightToRespond: 'Reasonable time to respond (5 business days recommended)'
    }
  },

  // PENNSYLVANIA
  {
    jurisdiction: 'Pennsylvania',
    jurisdictionType: 'state',
    banTheBoxLaws: {
      name: 'Pennsylvania Fair-Chance Hiring Policy (Executive Order 2017-03)',
      enacted: '2017',
      summary: 'Commonwealth of Pennsylvania established a fair-chance hiring policy for all state government departments under the Governor\'s jurisdiction. Removes criminal history questions from initial employment applications.',
      keyProvisions: [
        'Applies to all Commonwealth of Pennsylvania government departments',
        'Eliminates criminal history questions from initial job applications',
        'Candidates evaluated based on skills and qualifications first',
        'Cannot consider arrests not leading to conviction',
        'Cannot consider annulled, expunged, or pardoned convictions',
        'Cannot consider convictions unrelated to job suitability',
        'Must consider public interest in employment access for former offenders',
        'Limited to state government employment (private employers not covered statewide)'
      ],
      applies_to: 'Commonwealth of Pennsylvania government departments and agencies'
    },
    governmentAgencies: [
      {
        name: 'Pennsylvania Office of Administration - Human Resources',
        phone: '717-787-5545',
        website: 'https://www.oa.pa.gov/',
        filingInfo: 'For state government employment issues. Contact PA Office of Administration.'
      },
      {
        name: 'Pennsylvania Human Relations Commission',
        phone: '717-787-4410',
        website: 'https://www.phrc.pa.gov/',
        filingInfo: 'Handles employment discrimination complaints. File within 180 days of discrimination.'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Community Legal Services (Philadelphia)',
        phone: '215-981-3700',
        website: 'https://clsphila.org/',
        services: 'Free legal services for low-income Philadelphia residents including employment rights'
      },
      {
        name: 'Pennsylvania Legal Aid Network',
        phone: '800-322-7572',
        website: 'https://www.palegalaid.net/',
        services: 'Statewide network connecting residents to free legal assistance'
      },
      {
        name: 'Reentry Project - Defender Association of Philadelphia',
        phone: '215-568-3190',
        website: 'https://www.philadefender.org/',
        services: 'Legal assistance for people with criminal records including employment rights'
      }
    ],
    resources: [
      {
        title: 'Pennsylvania Fair-Chance Hiring Policy (Executive Order 2017-03)',
        url: 'https://www.oa.pa.gov/Policies/hr/Documents/TM001.pdf',
        description: 'Official state policy on fair-chance hiring for Commonwealth employees'
      },
      {
        title: 'File a Complaint with PA Human Relations Commission',
        url: 'https://www.phrc.pa.gov/AboutUs/Pages/File-a-Complaint.aspx',
        description: 'How to file employment discrimination complaint in Pennsylvania'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Criminal history removed from initial state government applications',
      adverseActionNotice: 'Must consider relevance of conviction to job duties',
      rightToRespond: 'Reasonable opportunity to provide context about criminal history'
    }
  },

  // PITTSBURGH
  {
    jurisdiction: 'Pittsburgh',
    jurisdictionType: 'city',
    banTheBoxLaws: {
      name: 'Pittsburgh Ban the Box Ordinance - Equal Opportunity for Persons Previously Convicted',
      enacted: '2023 (Effective August 3, 2023)',
      summary: 'City of Pittsburgh Ban the Box ordinance ensures equal employment opportunity for persons previously convicted. Applies to City contractors and prohibits criminal history inquiries until after determining applicants are otherwise qualified.',
      keyProvisions: [
        'Applies to all City of Pittsburgh contractors',
        'Contractors must inform applicants of their rights under the law',
        'Must include applicable Ban the Box language in contracts',
        'Cannot inquire about criminal conviction history until after applicant is found to be otherwise qualified',
        'Promotes fair consideration based on qualifications first',
        'Administered by Mayor\'s Office of Equal Protection',
        'Complaints filed with Office of Equal Protection'
      ],
      applies_to: 'City of Pittsburgh contractors (public contract employment)'
    },
    governmentAgencies: [
      {
        name: 'City of Pittsburgh Mayor\'s Office of Equal Protection',
        phone: '412-255-2621',
        email: 'BanTheBox@pittsburghpa.gov',
        website: 'https://www.pittsburghpa.gov/City-Government/Legal-Services/Office-of-Equal-Protection/Ban-the-Box',
        filingInfo: 'File complaint with Office of Equal Protection. Located at 414 Grant Street, 5th Floor, Pittsburgh PA 15219. Complaint forms available online or by mail.'
      },
      {
        name: 'Pittsburgh Commission on Human Relations',
        phone: '412-255-2600',
        website: 'https://pittsburghpa.gov/chr/',
        filingInfo: 'For broader employment discrimination complaints in Pittsburgh'
      },
      {
        name: 'Pennsylvania Human Relations Commission',
        phone: '412-565-5395',
        website: 'https://www.phrc.pa.gov/',
        filingInfo: 'For state-level employment discrimination complaints'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Neighborhood Legal Services Association',
        phone: '412-255-6700',
        website: 'https://www.nlsa.us/',
        services: 'Free civil legal services for low-income Pittsburgh area residents including employment issues'
      },
      {
        name: 'Just Harvest',
        phone: '412-431-8960',
        website: 'https://www.justharvest.org/',
        services: 'Advocacy and assistance for workers\' rights and employment issues'
      },
      {
        name: 'Pennsylvania Legal Aid Network',
        phone: '800-322-7572',
        website: 'https://www.palegalaid.net/',
        services: 'Connects Pittsburgh residents to free legal assistance'
      }
    ],
    resources: [
      {
        title: 'Pittsburgh Ban the Box - Official Page',
        url: 'https://www.pittsburghpa.gov/City-Government/Legal-Services/Office-of-Equal-Protection/Ban-the-Box',
        description: 'Official Office of Equal Protection page with ordinance, guidelines, and complaint forms'
      },
      {
        title: 'Ban the Box Ordinance (PDF)',
        url: 'https://www.pittsburghpa.gov/files/City-Government/Legal-Services/Office-of-Equal-Protection/Ban-the-Box/Ban-the-Box-Ordinance.pdf',
        description: 'Full text of Pittsburgh Ban the Box ordinance'
      },
      {
        title: 'Ban the Box Guidelines (PDF)',
        url: 'https://www.pittsburghpa.gov/files/City-Government/Legal-Services/Office-of-Equal-Protection/Ban-the-Box/Ban-the-Box-Guidelines.pdf',
        description: 'Guidelines for employers and contractors on compliance'
      },
      {
        title: 'Ban the Box FAQ (PDF)',
        url: 'https://www.pittsburghpa.gov/files/City-Government/Legal-Services/Office-of-Equal-Protection/Ban-the-Box/Ban-the-Box-FAQ.pdf',
        description: 'Frequently asked questions about Pittsburgh\'s Ban the Box law'
      },
      {
        title: 'File a Ban the Box Complaint',
        url: 'https://www.pittsburghpa.gov/City-Government/Legal-Services/Office-of-Equal-Protection/Ban-the-Box',
        description: 'How to file a complaint for violations of Pittsburgh\'s Ban the Box ordinance'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Cannot inquire about criminal conviction history until after determining applicant is otherwise qualified for the position',
      adverseActionNotice: 'Must consider qualifications first before inquiring about criminal history',
      rightToRespond: 'Applicants have right to be evaluated based on qualifications before criminal history is considered'
    }
  },

  // PHILADELPHIA
  {
    jurisdiction: 'Philadelphia',
    jurisdictionType: 'city',
    banTheBoxLaws: {
      name: 'Philadelphia Fair Criminal Record Screening Standards Ordinance (Ban the Box)',
      enacted: '2011 (Amended 2017, 2020, 2025)',
      summary: 'One of the strongest Ban the Box laws in the nation. Prohibits criminal history inquiries until after conditional offer. Recent 2025 amendments reduce lookback periods and strengthen protections.',
      keyProvisions: [
        'Applies to all employers in Philadelphia with one or more employees',
        'Cannot ask about criminal history on job applications or during interviews',
        'Can only conduct criminal background check AFTER extending conditional offer of employment',
        'Misdemeanor lookback period: 4 years (reduced from 7 years as of January 2026)',
        'Felony lookback period: 7 years from conviction date (excluding incarceration time)',
        'Cannot consider summary offenses (as of January 2026)',
        'Cannot consider arrests without convictions',
        'Must conduct individualized assessment if conviction found',
        'Must demonstrate specific conviction poses risk relevant to job',
        'Must consider rehabilitation evidence (training, education, character references)',
        'Must provide written rejection notice with copy of background report if denied based on record'
      ],
      applies_to: 'All employers with one or more employees in Philadelphia'
    },
    governmentAgencies: [
      {
        name: 'Philadelphia Commission on Human Relations',
        phone: '215-686-4670',
        email: 'humanrelations@phila.gov',
        website: 'https://www.phila.gov/departments/philadelphia-commission-on-human-relations/',
        filingInfo: 'File complaint within 180 days of violation. Commission investigates and enforces Fair Chance law. Can impose fines up to $2,000 per violation.'
      },
      {
        name: 'Pennsylvania Human Relations Commission',
        phone: '215-560-2496',
        website: 'https://www.phrc.pa.gov/',
        filingInfo: 'For broader employment discrimination complaints in Pennsylvania'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Community Legal Services of Philadelphia',
        phone: '215-981-3700',
        website: 'https://clsphila.org/',
        services: 'Free legal services including employment discrimination and Fair Chance violations'
      },
      {
        name: 'Philadelphia Legal Assistance',
        phone: '215-981-3800',
        website: 'https://philalegal.org/',
        services: 'Free civil legal aid for low-income Philadelphia residents'
      },
      {
        name: 'Reentry Project - Defender Association of Philadelphia',
        phone: '215-568-3190',
        website: 'https://www.philadefender.org/',
        services: 'Specializes in legal issues for people with criminal records including employment'
      },
      {
        name: 'Philadelphia Lawyers for Social Equity (PLSE)',
        phone: '267-765-3156',
        website: 'https://plsephilly.org/',
        services: 'Helps Philadelphians with criminal records clear their records and access employment'
      }
    ],
    resources: [
      {
        title: 'Philadelphia Fair Chance Hiring Law - Official Guide',
        url: 'https://www.phila.gov/2018-06-25-philadelphias-fair-chance-hiring-law-heres-what-you-should-know/',
        description: 'Official city guide explaining employee rights and employer responsibilities'
      },
      {
        title: '2025 Amendments to Philadelphia Fair Chance Ordinance',
        url: 'https://www.littler.com/news-analysis/asap/philadelphia-passes-additional-amendments-fair-chance-ordinance',
        description: 'Information on recent amendments effective January 6, 2026'
      },
      {
        title: 'File a Complaint with Philadelphia Commission on Human Relations',
        url: 'https://www.phila.gov/departments/philadelphia-commission-on-human-relations/',
        description: 'How to file a Fair Chance law violation complaint with the city'
      },
      {
        title: 'Philadelphia Fair Chance Ordinance - Full Text',
        url: 'https://codelibrary.amlegal.com/codes/philadelphia/latest/philadelphia_pa/0-0-0-269001',
        description: 'Complete text of Philadelphia\'s Fair Criminal Record Screening Standards'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Cannot conduct background check until AFTER conditional offer of employment',
      adverseActionNotice: 'Must provide written notice with copy of background report if denying employment based on criminal record',
      rightToRespond: 'Must allow reasonable time to respond and provide evidence of rehabilitation before final decision'
    }
  },

  // GEORGIA
  {
    jurisdiction: 'Georgia',
    jurisdictionType: 'state',
    banTheBoxLaws: {
      name: 'Georgia Executive Order - Ban the Box (Governor Nathan Deal, 2015)',
      enacted: '2015',
      summary: 'Executive order removes criminal history questions from initial state employment applications. Prohibits using criminal record as automatic disqualifier for state jobs. Does NOT apply to private employers statewide.',
      keyProvisions: [
        'Applies to state government employment ONLY',
        'Removes criminal history questions from initial job applications',
        'Criminal record cannot be automatic disqualifier',
        'Background checks conducted after candidate is considered qualified',
        'Does NOT cover private employers',
        'Local ordinances exist for Atlanta and Augusta-Richmond County government jobs'
      ],
      applies_to: 'Georgia state government agencies and departments (does not apply to private employers)'
    },
    governmentAgencies: [
      {
        name: 'Georgia Department of Labor',
        phone: '404-232-3001',
        website: 'https://www.dol.georgia.gov/',
        filingInfo: 'For state employment issues and workforce services'
      },
      {
        name: 'Georgia Commission on Equal Opportunity',
        phone: '404-656-1736',
        website: 'https://gceo.georgia.gov/',
        filingInfo: 'Handles employment discrimination complaints for state employees. File within 180 days of discrimination.'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Atlanta Legal Aid Society',
        phone: '404-524-5811',
        website: 'https://www.atlantalegalaid.org/',
        services: 'Free legal services for low-income Georgians in civil matters including employment'
      },
      {
        name: 'Georgia Legal Services Program',
        phone: '800-498-9469',
        website: 'https://www.glsp.org/',
        services: 'Statewide free legal services for low-income individuals'
      },
      {
        name: 'Southern Center for Human Rights',
        phone: '404-688-1202',
        website: 'https://www.schr.org/',
        services: 'Legal advocacy for people impacted by criminal justice system'
      }
    ],
    resources: [
      {
        title: 'Georgia Ban the Box Executive Order (2015)',
        url: 'https://www.nelp.org/georgia-governor-signs-ban-the-box-executive-order/',
        description: 'Information about Georgia\'s Ban the Box policy for state employment'
      },
      {
        title: 'Georgia Department of Labor - Job Seekers',
        url: 'https://www.dol.georgia.gov/',
        description: 'State employment resources and job search assistance'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'State jobs: Background checks after candidate considered qualified',
      adverseActionNotice: 'Criminal record cannot be automatic disqualifier for state employment',
      rightToRespond: 'Varies by state agency'
    }
  },

  // ATLANTA
  {
    jurisdiction: 'Atlanta',
    jurisdictionType: 'city',
    banTheBoxLaws: {
      name: 'Atlanta Human Relations Code - Criminal History Status Protection (Chapter 94)',
      enacted: '2014 (Amended to add criminal history as protected class)',
      summary: 'Atlanta Human Relations Code prohibits employment discrimination based on criminal history status. Applies to ALL employers, labor organizations, and employment agencies in Atlanta. One of the strongest local Fair Chance laws in the Southeast.',
      keyProvisions: [
        'Applies to ALL employers, labor organizations, employment agencies, and training programs in Atlanta',
        'Criminal history status is a protected class under Atlanta Human Relations Code',
        'Unlawful to discriminate in hiring, firing, compensation, or terms of employment based on criminal history',
        'Adverse decisions based on criminal history allowed ONLY when considering: 1) whether applicant committed offense, 2) nature and gravity of offense, 3) time since offense, 4) nature of job',
        'Cannot use criminal history as blanket disqualifier',
        'Exemptions: positions where convictions bar employment under state/federal law, positions with children, law enforcement',
        'Enforced by Atlanta Human Relations Commission',
        'Also includes Ban the Box policy for city government jobs'
      ],
      applies_to: 'ALL employers, labor organizations, and employment agencies in the City of Atlanta'
    },
    governmentAgencies: [
      {
        name: 'Atlanta Human Relations Commission',
        phone: '404-330-6300',
        website: 'https://www.atlantaga.gov/government/departments/human-relations-commission',
        filingInfo: 'File discrimination complaint with Atlanta HRC. Investigates violations of Human Relations Code including criminal history discrimination.'
      },
      {
        name: 'City of Atlanta Department of Human Resources',
        phone: '404-330-6100',
        website: 'https://www.atlantaga.gov/',
        filingInfo: 'For city employment issues and applications'
      },
      {
        name: 'Georgia Commission on Equal Opportunity',
        phone: '404-656-1736',
        website: 'https://gceo.georgia.gov/',
        filingInfo: 'Handles employment discrimination complaints. File within 180 days.'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Atlanta Legal Aid Society',
        phone: '404-524-5811',
        website: 'https://www.atlantalegalaid.org/',
        services: 'Free legal services for low-income Atlanta residents including employment issues'
      },
      {
        name: 'Southern Center for Human Rights',
        phone: '404-688-1202',
        website: 'https://www.schr.org/',
        services: 'Legal advocacy for people with criminal records in Atlanta area'
      },
      {
        name: 'Georgia Justice Project',
        phone: '404-827-0027',
        website: 'https://www.gjp.org/',
        services: 'Holistic legal services for Atlantans with criminal records including employment assistance'
      }
    ],
    resources: [
      {
        title: 'Atlanta Human Relations Code - Chapter 94 (Criminal History Protection)',
        url: 'https://www.jacksonlewis.com/sites/default/files/docs/AtlantaOrdinance-Attachment-92830.pdf',
        description: 'Official ordinance adding criminal history status as protected class (PDF)'
      },
      {
        title: 'Atlanta Human Relations Commission',
        url: 'https://www.atlantaga.gov/government/departments/human-relations-commission',
        description: 'Official HRC page - file complaints and learn about protections'
      },
      {
        title: 'City of Atlanta Human Relations Code',
        url: 'https://www.atlantaga.gov/',
        description: 'Information about protected classes and anti-discrimination laws in Atlanta'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Employers must consider criminal history in context of job responsibilities',
      adverseActionNotice: 'Must conduct individualized assessment using 4 factors: 1) whether offense committed, 2) nature/gravity, 3) time passed, 4) job nature',
      rightToRespond: 'Right to challenge discriminatory use of criminal history through Atlanta HRC complaint process'
    }
  },

  // MASSACHUSETTS
  {
    jurisdiction: 'Massachusetts',
    jurisdictionType: 'state',
    banTheBoxLaws: {
      name: 'Massachusetts Ban the Box Law (CORI Reform)',
      enacted: 'Ongoing reforms',
      summary: 'Massachusetts "Ban the Box" law prohibits most employers from asking about criminal history on job applications. Strong protections limit what types of records can be considered and require individualized assessment before denying employment.',
      keyProvisions: [
        'Applies to most employers in Massachusetts (exceptions for specific industries like day cares, financial institutions)',
        'Cannot ask about criminal history on initial job application',
        'Employers NEVER allowed to ask applicants to provide their own CORI or arrest records',
        'Cannot ask about at ANY point: cases without conviction (including CWOFs), arrests without conviction, first conviction for minor offenses, misdemeanors 3+ years old, juvenile records, sealed/expunged records',
        'After job application: can ask about felony convictions and some misdemeanor convictions',
        'Sealed records: applicant can answer "No Record"',
        'Must obtain written permission before accessing CORI through state system',
        'Before refusing to hire: must notify applicant, provide copy of CORI, provide info on correcting inaccuracies',
        'Should conduct individualized assessment considering: facts/circumstances, number of offenses, age at conviction, work history, rehabilitation efforts, character references',
        'Blanket exclusions may violate civil rights laws due to disproportionate impact on protected groups',
        'Enforced by Attorney General\'s Civil Rights Division'
      ],
      applies_to: 'Most employers in Massachusetts (limited exceptions for specific industries)'
    },
    governmentAgencies: [
      {
        name: 'Massachusetts Attorney General\'s Office - Civil Rights Division',
        phone: '617-963-2917',
        website: 'https://www.mass.gov/orgs/civil-rights-division',
        filingInfo: 'File complaint online, by phone at (617) 963-2917, or in person at 100 Cambridge Street, 11th floor, Boston (Mon-Fri 9:30am-4:30pm). Will contact you within one week of receiving complaint.'
      },
      {
        name: 'Massachusetts Commission Against Discrimination (MCAD)',
        phone: '617-994-6000',
        website: 'https://www.mass.gov/orgs/massachusetts-commission-against-discrimination',
        filingInfo: 'Handles employment discrimination complaints including criminal history discrimination'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Greater Boston Legal Services - CORI & Re-Entry Project',
        phone: '617-371-1234',
        website: 'https://www.gbls.org/',
        services: 'Free legal services for low-income individuals including CORI issues and employment discrimination'
      },
      {
        name: 'Massachusetts Legal Help',
        website: 'https://www.masslegalhelp.org/',
        services: 'Online legal information and resources including criminal records and employment'
      },
      {
        name: 'Community Legal Aid',
        phone: '800-742-4107',
        website: 'https://www.communitylegal.org/',
        services: 'Free civil legal services across Massachusetts including employment issues'
      }
    ],
    resources: [
      {
        title: 'Mass.gov Guide to Criminal Records in Employment',
        url: 'https://www.mass.gov/guides/guide-to-criminal-records-in-employment-and-housing',
        description: 'Official Attorney General guide - comprehensive FAQ on employment rights'
      },
      {
        title: 'Know Your Rights Guide on Criminal Records (PDF)',
        url: 'https://www.mass.gov/doc/ago-know-your-rights-guide-on-criminal-records-a-guide-to-rights-in-employment-and-housing',
        description: 'AGO guide to rights in employment and housing for people with criminal records'
      },
      {
        title: 'AGO Guide for Employers That Use Criminal Records In Hiring (PDF)',
        url: 'https://www.mass.gov/doc/ago-guide-for-employers-that-use-criminal-records-in-hiring',
        description: 'Employer compliance guide from Attorney General\'s Office'
      },
      {
        title: 'File a Civil Rights Complaint',
        url: 'https://www.mass.gov/how-to/file-a-civil-rights-complaint',
        description: 'How to file employment discrimination complaint with Attorney General\'s Civil Rights Division'
      },
      {
        title: 'Request a Copy of Your CORI',
        url: 'https://www.mass.gov/how-to/request-your-criminal-record',
        description: 'How to obtain your own criminal offender record information (CORI) from the state'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Must obtain written permission before accessing CORI. Must provide copy of CORI and notice before refusing to hire',
      adverseActionNotice: 'Must notify applicant and provide copy of CORI before refusing to hire based on criminal record',
      rightToRespond: 'Must provide information on how to correct inaccurate criminal record. Should conduct individualized assessment considering rehabilitation and other factors'
    }
  },

  // BOSTON
  {
    jurisdiction: 'Boston',
    jurisdictionType: 'city',
    banTheBoxLaws: {
      name: 'Boston Fair Chance Act (Chapter 15, Section 10 of Boston Code)',
      enacted: 'Ongoing enforcement',
      summary: 'Boston\'s Fair Chance Hiring Ordinance promotes equal employment opportunities by prohibiting discrimination against individuals with criminal records. Emphasizes nondiscrimination and equal opportunity in hiring decisions.',
      keyProvisions: [
        'Applies to employers in Boston (part of broader city diversity and inclusion efforts)',
        'Prohibits discrimination based on criminal history in employment',
        'Cannot inquire about criminal history on initial job applications',
        'Cannot inquire about criminal history until after initial interview or conditional offer',
        'Must conduct individualized assessment before denying employment based on criminal record',
        'Must consider: nature of offense, time elapsed since offense, and relevance to job duties',
        'Cannot consider arrests without convictions',
        'Cannot consider sealed, expunged, or pardoned records',
        'Must provide notification if criminal history is factor in adverse employment decision',
        'Applicants must be given opportunity to respond with mitigating information',
        'Part of broader Boston diversity and inclusion ordinance',
        'Complements Massachusetts statewide CORI Reform protections'
      ],
      applies_to: 'Employers in the City of Boston'
    },
    governmentAgencies: [
      {
        name: 'Boston Fair Housing and Equity Office',
        phone: '617-635-4408',
        website: 'https://www.boston.gov/departments/fair-housing-and-equity',
        filingInfo: 'Handles discrimination complaints in Boston. Contact for Fair Chance violations.'
      },
      {
        name: 'Massachusetts Attorney General\'s Office - Civil Rights Division',
        phone: '617-963-2917',
        website: 'https://www.mass.gov/orgs/civil-rights-division',
        filingInfo: 'File complaint with AG Civil Rights Division within 300 days. Handles employment discrimination statewide including Boston.'
      },
      {
        name: 'Massachusetts Commission Against Discrimination (MCAD)',
        phone: '617-994-6000',
        website: 'https://www.mass.gov/orgs/massachusetts-commission-against-discrimination',
        filingInfo: 'File employment discrimination complaint within 300 days. Covers Boston and all of Massachusetts.'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Greater Boston Legal Services - CORI & Re-Entry Project',
        phone: '617-371-1234',
        website: 'https://www.gbls.org/',
        services: 'Free legal services for low-income Bostonians including CORI issues and employment discrimination'
      },
      {
        name: 'Massachusetts Legal Help',
        website: 'https://www.masslegalhelp.org/',
        services: 'Online legal information and resources including criminal records and employment'
      },
      {
        name: 'Community Legal Aid',
        phone: '800-742-4107',
        website: 'https://www.communitylegal.org/',
        services: 'Free civil legal services across Massachusetts including Boston employment issues'
      },
      {
        name: 'Boston Bar Association Lawyer Referral Service',
        phone: '617-742-0625',
        website: 'https://www.bostonbar.org/',
        services: 'Referrals to private attorneys for employment discrimination cases'
      }
    ],
    resources: [
      {
        title: 'Boston Fair Chance Act - City Code Chapter 15, Section 10',
        url: 'https://codelibrary.amlegal.com/codes/boston/latest/boston_ma/0-0-0-10021',
        description: 'Official Boston Code - diversity, nondiscrimination, and fair hiring practices'
      },
      {
        title: 'Boston Office of Fair Housing and Equity',
        url: 'https://www.boston.gov/departments/fair-housing-and-equity',
        description: 'City office handling discrimination complaints and fair employment practices'
      },
      {
        title: 'Mass.gov Guide to Criminal Records in Employment',
        url: 'https://www.mass.gov/guides/guide-to-criminal-records-in-employment-and-housing',
        description: 'Official Attorney General guide - comprehensive FAQ on employment rights in Massachusetts'
      },
      {
        title: 'File a Civil Rights Complaint',
        url: 'https://www.mass.gov/how-to/file-a-civil-rights-complaint',
        description: 'How to file employment discrimination complaint with Massachusetts AG Civil Rights Division'
      },
      {
        title: 'File with Massachusetts Commission Against Discrimination',
        url: 'https://www.mass.gov/orgs/massachusetts-commission-against-discrimination',
        description: 'File employment discrimination complaint with MCAD'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Cannot inquire about criminal history on initial applications or until after initial interview/conditional offer',
      adverseActionNotice: 'Must notify applicant if criminal history is factor in adverse decision and conduct individualized assessment',
      rightToRespond: 'Must give applicant opportunity to respond with mitigating information before final decision'
    }
  },

  // RHODE ISLAND
  {
    jurisdiction: 'Rhode Island',
    jurisdictionType: 'state',
    banTheBoxLaws: {
      name: 'Rhode Island Ban-the-Box Law (R.I. Gen. Laws § 28-5-7(7)) & Fair Chance Licensing Act (R.I. Gen. Laws § 28-5.1-14)',
      enacted: 'Ban-the-Box: 2013 (Effective January 1, 2014); Fair Chance Licensing: July 2020 (Effective January 1, 2021)',
      summary: 'Rhode Island has comprehensive Fair Chance protections. Employment law prohibits inquiring about arrests/convictions until first interview. Groundbreaking Fair Chance Licensing law prevents denial of professional licenses based on unrelated criminal convictions - opening career paths for people released from prison.',
      keyProvisions: [
        'EMPLOYMENT (§ 28-5-7): Applies to ALL public and private employers statewide',
        'Cannot inquire about arrests OR convictions (orally or in writing) until first interview',
        'Exemptions: law enforcement, federal/state mandatory disqualification, positions requiring fidelity bond',
        'LICENSING (§ 28-5.1-14): Prevents denial of occupational licenses for unrelated convictions',
        'Standardized process: only convictions DIRECTLY related to licensed occupation duties can be considered',
        '"Substantial relationship" test considers: 1) equal employment access, 2) public safety, 3) job ability/fitness',
        'Must consider rehabilitation - 2 crime-free years in community demonstrates rehabilitation',
        'Cannot consider: non-convictions, juvenile records, expunged records, misdemeanors without incarceration',
        'Transparent process: written reasons required for denials, appeals allowed',
        'Licensing agencies must publicly report: number of applicants, denials, demographic breakdown',
        'Over 70% of lower-income occupations require licenses - this law removes barriers',
        'Supported by 30+ organizations including DARE, ACLU RI, RI Commission for Human Rights'
      ],
      applies_to: 'All public and private employers AND all state licensing agencies in Rhode Island'
    },
    governmentAgencies: [
      {
        name: 'Rhode Island Commission for Human Rights',
        phone: '401-222-2661',
        website: 'http://www.richr.ri.gov/filecharge/index.php',
        filingInfo: 'File employment discrimination complaint within 1 year of violation. Commission investigates and enforces fair employment practices.'
      },
      {
        name: 'Rhode Island Department of Labor and Training',
        phone: '401-462-8000',
        website: 'https://dlt.ri.gov/',
        filingInfo: 'For employment-related issues and workforce resources'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Rhode Island Legal Services',
        phone: '401-274-2652',
        website: 'https://www.rils.org/',
        services: 'Free civil legal services for low-income Rhode Islanders including employment discrimination'
      },
      {
        name: 'OpenDoors Rhode Island',
        phone: '401-861-7379',
        website: 'https://www.opendoorsri.org/',
        services: 'Support and advocacy for people with criminal records, including employment assistance'
      },
      {
        name: 'Economic Progress Institute',
        phone: '401-456-8512',
        website: 'https://www.economicprogressri.org/',
        services: 'Policy advocacy and resources for workers\' rights including Fair Chance hiring'
      }
    ],
    resources: [
      {
        title: 'Rhode Island Ban-the-Box Law (R.I. Gen. Laws § 28-5-7)',
        url: 'http://webserver.rilin.state.ri.us/Statutes/TITLE28/28-5/28-5-7.HTM',
        description: 'Official statute - prohibits criminal history inquiries until first interview'
      },
      {
        title: 'Rhode Island Fair Chance Licensing Act (R.I. Gen. Laws § 28-5.1-14)',
        url: 'http://webserver.rilin.state.ri.us/Statutes/TITLE28/28-5.1/28-5.1-14.HTM',
        description: 'Official statute - prevents denial of occupational licenses for unrelated convictions'
      },
      {
        title: 'Fair Chance Licensing Press Release (July 2020)',
        url: 'https://www.rilegislature.gov/pressrelease/_layouts/15/ril.pressrelease.inputform/DisplayForm.aspx?List=c8baae31-3c10-431c-8dcd-9dbbe21ce3e9&ID=370998',
        description: 'RI General Assembly announcement - reform opens career paths for formerly incarcerated'
      },
      {
        title: 'Fair Chance Licensing Bill Text (2020-S 2824A)',
        url: 'http://webserver.rilin.state.ri.us/BillText/BillText20/SenateText20/S2824A.pdf',
        description: 'Full text of Senate bill establishing Fair Chance Licensing standards (PDF)'
      },
      {
        title: 'File a Complaint with RI Commission for Human Rights',
        url: 'http://www.richr.ri.gov/filecharge/iq.php',
        description: 'How to file employment discrimination complaint in Rhode Island'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Cannot inquire about arrests or convictions until first interview',
      adverseActionNotice: 'For licensing: must provide written reasons if denying based on conviction, including substantial relationship analysis',
      rightToRespond: 'For licensing: must be permitted to respond and given opportunity to appeal. Can establish rehabilitation after 2 crime-free years'
    }
  },

  // TEXAS
  {
    jurisdiction: 'Texas',
    jurisdictionType: 'state',
    banTheBoxLaws: {
      name: 'Texas Labor Code Chapter 521',
      enacted: '2015',
      summary: 'Prohibits state agencies and contractors from asking about criminal history on initial application. NOTE: Private employers in Texas are NOT covered by state law, but Austin has strong city-level protections.',
      keyProvisions: [
        'Applies to state agencies and contractors only',
        'Cannot ask about criminal history on initial application',
        'Limited protections - does NOT apply to private employers',
        'Private employers covered only by local ordinances in Austin and San Antonio'
      ],
      applies_to: 'Texas state agencies and contractors only (NOT private employers)'
    },
    governmentAgencies: [
      {
        name: 'Texas Workforce Commission - Civil Rights Division',
        phone: '888-452-4778',
        website: 'https://www.twc.texas.gov/jobseekers/civil-rights-division',
        filingInfo: 'File complaint within 180 days of discrimination. For state employment only.'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Texas RioGrande Legal Aid',
        phone: '888-988-9996',
        website: 'https://www.trla.org/',
        services: 'Free legal services for low-income Texans'
      },
      {
        name: 'Texas Fair Defense Project',
        phone: '512-637-3781',
        website: 'https://www.fairdefense.org/',
        services: 'Legal services and advocacy for people with criminal records in Texas'
      }
    ],
    resources: [
      {
        title: 'Texas Labor Code Chapter 521',
        url: 'https://statutes.capitol.texas.gov/Docs/LA/htm/LA.521.htm',
        description: 'Official text of Texas Ban the Box law for state agencies'
      },
      {
        title: 'Texas Workforce Commission',
        url: 'https://www.twc.texas.gov/',
        description: 'Information about employment rights in Texas'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'State agencies: Cannot ask on initial application. Private employers: Follow FCRA federal requirements or local ordinances (Austin, San Antonio)',
      adverseActionNotice: 'Follow FCRA federal requirements'
    }
  },

  // IOWA
  {
    jurisdiction: 'Iowa',
    jurisdictionType: 'state',
    banTheBoxLaws: {
      name: 'Iowa Fair Chance Hiring Law (Ordinance 5522 and Iowa Code Section 364.3(12)(a))',
      enacted: 'Codified in Iowa Code Section 364.3',
      summary: 'Iowa law protects job applicants with criminal records by prohibiting blanket disqualifications. Employers may only make adverse hiring decisions based on criminal records when the criminal conduct has a direct and substantial bearing on job fitness, or when employment would create unreasonable risk.',
      keyProvisions: [
        'Applies to employers in Iowa',
        'Prohibits blanket disqualifications based on criminal records',
        'Adverse hiring decision only permitted if criminal conduct has "direct and substantial bearing" on job fitness',
        'Employers must consider multiple factors before making adverse decision:',
        '  - Nature of the employment',
        '  - Place and manner of employment',
        '  - Nature and seriousness of the offense',
        '  - Opportunity for similar offense in the position',
        '  - Time elapsed since conviction or arrest',
        '  - Number and types of convictions',
        '  - Evidence of rehabilitation',
        'Adverse decision permitted when employment would involve unreasonable risk to property, safety, or business reputation',
        'Special provisions for positions working with vulnerable populations with relevant convictions',
        'Exemptions when required by federal or state law regarding background checks',
        'Must conduct individualized assessment - no categorical exclusions allowed'
      ],
      applies_to: 'Employers in Iowa subject to Ordinance 5522 and Iowa Code Section 364.3(12)(a)'
    },
    governmentAgencies: [
      {
        name: 'Iowa Civil Rights Commission',
        phone: '515-281-4121',
        website: 'https://icrc.iowa.gov/',
        filingInfo: 'File employment discrimination complaint with Iowa Civil Rights Commission. Must file within 300 days of discrimination.'
      },
      {
        name: 'Iowa Workforce Development',
        phone: '515-281-5387',
        website: 'https://www.iowaworkforcedevelopment.gov/',
        filingInfo: 'Resources for employment issues and workforce services'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Iowa Legal Aid',
        phone: '800-532-1275',
        website: 'https://www.iowalegalaid.org/',
        services: 'Free legal services for low-income Iowans including employment discrimination'
      },
      {
        name: 'Polk County Bar Association Volunteer Lawyers Project',
        phone: '515-243-3179',
        website: 'https://www.polkcountybar.org/',
        services: 'Pro bono legal assistance including employment issues'
      },
      {
        name: 'Iowa State Bar Association - Lawyer Referral',
        phone: '515-243-3179',
        website: 'https://www.iowabar.org/',
        services: 'Attorney referrals for employment discrimination cases'
      }
    ],
    resources: [
      {
        title: 'Iowa Code Section 364.3(12)(a)',
        url: 'https://www.legis.iowa.gov/docs/code/364.3.pdf',
        description: 'Official Iowa Code provision on fair chance hiring standards'
      },
      {
        title: 'Iowa Civil Rights Commission',
        url: 'https://icrc.iowa.gov/',
        description: 'File employment discrimination complaints and learn about worker protections'
      },
      {
        title: 'Iowa Workforce Development - Employment Resources',
        url: 'https://www.iowaworkforcedevelopment.gov/',
        description: 'Information about employment rights and resources in Iowa'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Must conduct individualized assessment using "direct and substantial bearing" test before adverse hiring decision',
      adverseActionNotice: 'Must consider: nature of employment, offense seriousness, time elapsed, rehabilitation evidence, and risk to property/safety',
      rightToRespond: 'File discrimination complaint with Iowa Civil Rights Commission within 300 days of adverse action'
    }
  },

  // WISCONSIN
  {
    jurisdiction: 'Wisconsin',
    jurisdictionType: 'state',
    banTheBoxLaws: {
      name: 'Wisconsin Fair Employment Act - Arrest and Conviction Record Protection (Wis. Stat. §§ 111.31-111.395)',
      enacted: 'Long-standing protection under state civil rights law',
      summary: 'Wisconsin state law protects workers from employment discrimination based on arrest or conviction records, unless the arrest or conviction is substantially related to the employment. Employers cannot use criminal history as a blanket disqualifier and cannot ask about arrests that did not lead to conviction.',
      keyProvisions: [
        'Applies to ALL employers in Wisconsin (statewide protection)',
        'Protects against discrimination in hiring, firing, promotion, pay, benefits, training, and other employment decisions',
        'Employers CANNOT ask about arrests that did not lead to conviction',
        'Employers CANNOT use conviction records as blanket disqualifier',
        'Can only consider arrests/convictions if "substantially related" to the specific job',
        '"Substantially related" means overlap between circumstances of job and circumstances of offense (e.g., theft conviction substantially related to cashier job)',
        'Each job and record must be considered individually - no categorical exclusions',
        'Employer may ask about pending charges or convictions, but must make clear these are only considered if substantially related',
        'Employer may suspend employee if pending charge is substantially related to job',
        'Cannot refuse to hire based on co-worker or customer preference about criminal records',
        'Conviction record that is not substantially related should be given NO consideration',
        'Equal Rights Division makes determination if dispute about whether record is substantially related',
        'File complaint within 300 days of discriminatory action'
      ],
      applies_to: 'All employers in Wisconsin'
    },
    governmentAgencies: [
      {
        name: 'Wisconsin Department of Workforce Development - Equal Rights Division',
        phone: '608-266-3131',
        website: 'https://dwd.wisconsin.gov/er/civilrights/',
        filingInfo: 'File complaint within 300 days of discrimination. Can file online or by mail. Equal Rights Division investigates and makes determinations on substantial relationship disputes.'
      },
      {
        name: 'Wisconsin Equal Rights Division - Civil Rights Bureau',
        phone: '608-266-6860',
        website: 'https://dwd.wisconsin.gov/er/civilrights/discrimination/arrest.htm',
        filingInfo: 'Handles arrest and conviction record discrimination complaints. Available online complaint portal and paper forms.'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Legal Action of Wisconsin',
        phone: '855-947-2529',
        website: 'https://www.legalaction.org/',
        services: 'Free civil legal services for low-income Wisconsin residents including employment discrimination'
      },
      {
        name: 'Wisconsin Judicare',
        phone: '800-472-1638',
        website: 'https://www.judicare.org/',
        services: 'Free legal assistance for low-income individuals in northern Wisconsin including employment issues'
      },
      {
        name: 'State Bar of Wisconsin - Lawyer Referral',
        phone: '800-362-9082',
        website: 'https://www.wisbar.org/forpublic/ineedhelp/pages/lawyer-referral-service.aspx',
        services: 'Attorney referrals for employment discrimination cases'
      }
    ],
    resources: [
      {
        title: 'Wisconsin Arrest and Conviction Record Discrimination',
        url: 'https://dwd.wisconsin.gov/er/civilrights/discrimination/arrest.htm',
        description: 'Official DWD page explaining protections, substantial relationship test, and FAQs'
      },
      {
        title: 'Wisconsin Statutes Chapter 111.31-111.395 (Fair Employment Act)',
        url: 'https://docs.legis.wisconsin.gov/statutes/statutes/111',
        description: 'Full text of Wisconsin Fair Employment Act including arrest/conviction protections'
      },
      {
        title: 'Wisconsin Administrative Code DWD 218',
        url: 'https://docs.legis.wisconsin.gov/code/admin_code/dwd/218',
        description: 'Administrative rules implementing arrest and conviction record discrimination protections'
      },
      {
        title: 'File a Complaint Online (ERD-4206)',
        url: 'https://dwd.wisconsin.gov/er/civilrights/complaint/',
        description: 'Online complaint form for Equal Rights Division'
      },
      {
        title: 'File a Complaint - Paper Form (ERD-4206)',
        url: 'https://dwd.wisconsin.gov/dwd/publications/erd/pdf/erd_4206_p.pdf',
        description: 'Downloadable PDF complaint form to be mailed'
      },
      {
        title: 'Equal Rights Division Complaint Process',
        url: 'https://dwd.wisconsin.gov/er/civilrights/process/',
        description: 'How the complaint investigation and resolution process works'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Cannot ask about arrests without conviction. Can only ask about pending charges or convictions if substantially related to job.',
      adverseActionNotice: 'Must demonstrate arrest or conviction is substantially related to specific job duties before taking adverse action',
      rightToRespond: 'File complaint within 300 days of discriminatory action. Equal Rights Division investigates and determines if substantial relationship exists.'
    }
  },

  // AUSTIN
  {
    jurisdiction: 'Austin',
    jurisdictionType: 'city',
    banTheBoxLaws: {
      name: 'Austin Fair Chance Hiring Ordinance',
      enacted: 'April 4, 2016',
      summary: 'Austin\'s Fair Chance Hiring Ordinance aims to reduce recidivism and unemployment and increase re-integration for qualified job applicants with criminal histories. Places restrictions on certain private employers on when they can ask about criminal history and how that information can be used.',
      keyProvisions: [
        'Applies to private employers with 15 or more employees in Austin',
        'Cannot inquire about criminal history on initial job application',
        'Can only ask about criminal history after applicant has been interviewed or received conditional job offer',
        'Employers must conduct individualized assessment considering: nature/gravity of offense, time elapsed, nature of job',
        'Cannot automatically disqualify based on criminal history',
        'Must consider rehabilitation efforts and mitigating factors',
        'Exemptions: positions where criminal history inquiry required by law, positions with children/vulnerable adults',
        'Enforced by City of Austin Office of Civil Rights',
        'Complaints investigated by Office of Civil Rights',
        'Violations can result in penalties and fines'
      ],
      applies_to: 'Private employers with 15 or more employees in the City of Austin'
    },
    governmentAgencies: [
      {
        name: 'City of Austin Office of Civil Rights',
        phone: '512-972-3247 (512-972-FAIR)',
        email: 'fairchancehiring@austintexas.gov',
        website: 'https://www.austintexas.gov/department/fair-chance-hiring',
        filingInfo: 'File Fair Chance Hiring complaint with Office of Civil Rights. Call 512-972-FAIR (3247) or email fairchancehiring@austintexas.gov. Office investigates violations and provides education/outreach.'
      },
      {
        name: 'Texas Workforce Commission - Civil Rights Division',
        phone: '888-452-4778',
        website: 'https://www.twc.texas.gov/jobseekers/civil-rights-division',
        filingInfo: 'For other employment discrimination complaints in Texas'
      }
    ],
    legalAidOrganizations: [
      {
        name: 'Texas RioGrande Legal Aid - Austin Office',
        phone: '512-374-2700',
        website: 'https://www.trla.org/',
        services: 'Free legal services for low-income Austin residents including employment discrimination'
      },
      {
        name: 'Texas Fair Defense Project',
        phone: '512-637-3781',
        website: 'https://www.fairdefense.org/',
        services: 'Legal services and advocacy for people with criminal records, including employment rights'
      },
      {
        name: 'Austin Lawyers for Immigrants and Legal Services',
        phone: '512-476-7707',
        website: 'https://www.allslaw.org/',
        services: 'Legal services including employment discrimination'
      },
      {
        name: 'Volunteer Legal Services of Central Texas',
        phone: '512-476-5550',
        website: 'https://www.vlsoct.org/',
        services: 'Free legal assistance for low-income individuals including employment issues'
      }
    ],
    resources: [
      {
        title: 'Austin Fair Chance Hiring - Official City Page',
        url: 'https://www.austintexas.gov/department/fair-chance-hiring',
        description: 'Official Office of Civil Rights page with ordinance info, FAQs, and training resources'
      },
      {
        title: 'Austin Fair Chance Hiring Ordinance - Full Text',
        url: 'https://www.austintexas.gov/department/fair-chance-hiring',
        description: 'Read the complete Fair Chance Hiring ordinance'
      },
      {
        title: 'Fair Chance Hiring FAQ',
        url: 'https://www.austintexas.gov/department/fair-chance-hiring',
        description: 'Frequently asked questions about Austin Fair Chance Hiring law'
      },
      {
        title: 'Employer Fact Sheet (PDF)',
        url: 'https://www.austintexas.gov/department/fair-chance-hiring',
        description: 'Downloadable fact sheet for employers about compliance'
      },
      {
        title: 'Job Seeker Fact Sheet (PDF)',
        url: 'https://www.austintexas.gov/department/fair-chance-hiring',
        description: 'Downloadable fact sheet for job seekers about their rights'
      },
      {
        title: 'File a Fair Chance Hiring Complaint',
        url: 'https://www.austintexas.gov/department/fair-chance-hiring',
        description: 'How to file a complaint with Austin Office of Civil Rights'
      },
      {
        title: 'Travis County Reentry Resource Guide',
        url: 'https://www.austintexas.gov/department/fair-chance-hiring',
        description: 'Comprehensive resource guide for people with criminal records in Austin/Travis County'
      }
    ],
    timelines: {
      backgroundCheckNotice: 'Cannot inquire about criminal history on initial job application',
      adverseActionNotice: 'Must conduct individualized assessment before denying employment based on criminal history',
      rightToRespond: 'Must consider rehabilitation efforts, time passed, and other mitigating factors before making final decision'
    }
  }
];

/**
 * Get legal resources for a specific jurisdiction
 */
export function getLegalResourcesByJurisdiction(state?: string, city?: string): LegalResource[] {
  const resources: LegalResource[] = [];
  
  // Always include federal resources
  const federalResource = legalResourcesData.find(r => r.jurisdiction === 'Federal');
  if (federalResource) {
    resources.push(federalResource);
  }
  
  // Helper function for flexible matching (handles "San Diego" vs "San Diego County", etc.)
  const matchesLocation = (jurisdiction: string, location: string): boolean => {
    const jLower = jurisdiction.toLowerCase();
    const lLower = location.toLowerCase();
    // Exact match
    if (jLower === lLower) return true;
    // Check if location contains jurisdiction (e.g., "San Diego County" contains "San Diego")
    if (lLower.includes(jLower)) return true;
    // Check if jurisdiction contains location (e.g., "San Diego" is in "San Diego County")
    if (jLower.includes(lLower)) return true;
    return false;
  };
  
  // Add city-specific resources if city is provided
  if (city) {
    const cityResource = legalResourcesData.find(
      r => r.jurisdictionType === 'city' && matchesLocation(r.jurisdiction, city)
    );
    if (cityResource) {
      resources.push(cityResource);
    }
  }
  
  // Add county-specific resources if city is provided
  if (city) {
    const countyResource = legalResourcesData.find(
      r => r.jurisdictionType === 'county' && matchesLocation(r.jurisdiction, city)
    );
    if (countyResource) {
      resources.push(countyResource);
    }
  }
  
  // Add state-specific resources if state is provided
  if (state) {
    const stateResource = legalResourcesData.find(
      r => r.jurisdictionType === 'state' && matchesLocation(r.jurisdiction, state)
    );
    if (stateResource) {
      resources.push(stateResource);
    }
  }
  
  return resources;
}

/**
 * Get all available jurisdictions
 */
export function getAllJurisdictions(): string[] {
  return legalResourcesData
    .filter(r => r.jurisdictionType !== 'federal')
    .map(r => r.jurisdiction)
    .sort();
}

