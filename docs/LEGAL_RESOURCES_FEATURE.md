# Legal Resources Feature - Implementation Guide

## Overview

The Legal Resources tab has been significantly enhanced to provide candidates with **jurisdiction-specific Fair Chance Hiring legal resources** based on their location, rather than just a contact form.

## What Was Changed

### 1. **New Data File: `/src/data/legalResources.ts`**

This file contains comprehensive Fair Chance Hiring legal information for multiple jurisdictions:

**Included Jurisdictions:**
- Federal (applies nationwide)
- California (state-wide)
- Los Angeles (city-specific)
- San Francisco (city-specific)
- New York (state-wide)
- Illinois (state-wide)
- Texas (state-wide)

**Information Provided for Each Jurisdiction:**
- Ban the Box law details and key provisions
- When the law was enacted
- Who it applies to (employer size requirements)
- Government agencies (with phone, email, website)
- Filing information and deadlines
- Free legal aid organizations
- Additional resources and links
- Important timelines (background checks, adverse action, response periods)

### 2. **New Component: `/src/components/LegalResourcesDisplay.tsx`**

A professional, well-designed React component that displays legal resources with:
- Expandable sections for key provisions
- Color-coded jurisdiction types (Federal, State, City)
- Contact information with clickable links (phone, email, website)
- Government agency filing information
- Free legal aid organizations
- Additional resource links
- Important timeline information
- Automatic location detection

### 3. **Updated: `/src/app/restorative-record/page.tsx`**

The Legal Resources section now:
- Fetches user's location (city and state) from their profile
- Automatically shows relevant jurisdiction-specific resources
- Displays Federal resources for all users
- Displays state resources if state is in database
- Displays city resources if city is in database
- Still includes the contact form for partnered legal assistance

## How It Works

### Location Detection

```typescript
// User's location is automatically fetched
const { data: profile } = await supabase
  .from('user_profiles')
  .select('city, state')
  .eq('id', user.id)
  .single();

// Resources are fetched based on location
const legalResources = getLegalResourcesByJurisdiction(
  userProfile?.state,
  userProfile?.city
);
```

### Resource Matching

1. **Federal resources** are always shown (applies to all users nationwide)
2. **State resources** are shown if the user's state matches a jurisdiction in the database
3. **City resources** are shown if the user's city matches a jurisdiction in the database

Example:
- User in San Francisco, CA sees: Federal + California + San Francisco resources
- User in Los Angeles, CA sees: Federal + California + Los Angeles resources
- User in Dallas, TX sees: Federal + Texas resources
- User with no location set sees: Federal resources + prompt to add location

## Features

### For Candidates

1. **Know Your Rights**
   - See specific Fair Chance laws that protect them
   - Understand what employers can and cannot ask
   - Learn about individualized assessment requirements

2. **File Complaints**
   - Direct links to government agencies
   - Contact information (phone, email, website)
   - Filing deadlines and requirements

3. **Get Free Legal Help**
   - List of free legal aid organizations
   - Specialized services for people with criminal records
   - Contact information for each organization

4. **Access Resources**
   - Official law texts
   - "Know Your Rights" guides
   - Online complaint filing systems

5. **Understand Timelines**
   - Background check notice requirements
   - Adverse action notice requirements
   - How long candidates have to respond

### User Experience Enhancements

- **Clean, Professional Design**: Uses your brand colors (#E54747 for accents)
- **Expandable Sections**: Keeps interface clean while providing detailed information
- **Clickable Contact Info**: Phone numbers, emails, and websites are all clickable
- **Color-Coded Tags**: Easy to see if resource is Federal, State, or City
- **Mobile Responsive**: Works perfectly on all screen sizes
- **Accessible**: Proper ARIA labels and semantic HTML

## Adding New Jurisdictions

To add a new jurisdiction, add an entry to the `legalResourcesData` array in `/src/data/legalResources.ts`:

```typescript
{
  jurisdiction: 'Chicago',
  jurisdictionType: 'city',
  banTheBoxLaws: {
    name: 'Chicago Fair Chance Licensing Ordinance',
    enacted: '2021',
    summary: 'Description of the law...',
    keyProvisions: [
      'Provision 1',
      'Provision 2',
    ],
    applies_to: 'Who the law applies to'
  },
  governmentAgencies: [
    {
      name: 'Agency Name',
      phone: '123-456-7890',
      email: 'email@agency.gov',
      website: 'https://agency.gov',
      filingInfo: 'How to file complaints'
    }
  ],
  legalAidOrganizations: [
    {
      name: 'Organization Name',
      phone: '123-456-7890',
      website: 'https://org.org',
      services: 'Description of services'
    }
  ],
  resources: [
    {
      title: 'Resource Title',
      url: 'https://resource.url',
      description: 'Description'
    }
  ],
  timelines: {
    backgroundCheckNotice: 'Notice requirement',
    adverseActionNotice: 'Adverse action notice requirement',
    rightToRespond: 'Response time allowed'
  }
}
```

## Data Sources

The legal resources data has been compiled from:
- Official government websites
- State and local legislation
- EEOC guidance
- Legal aid organization websites
- Fair chance hiring advocacy organizations

**Note:** This information should be reviewed and updated periodically as laws change.

## Future Enhancements

Potential improvements:
1. **Automatic Updates**: API integration to pull latest legal information
2. **More Jurisdictions**: Add all US states and major cities
3. **Search Function**: Let users search for specific topics or questions
4. **Case Studies**: Add examples of successful fair chance cases
5. **Video Guides**: Embed video explanations of rights
6. **Document Templates**: Provide template letters for responding to employers
7. **Multi-language Support**: Translate resources into other languages
8. **Chat Integration**: Add live chat with legal experts

## Testing

To test the feature:

1. **With Location Set:**
   - Update your profile with city and state (e.g., "San Francisco", "California")
   - Navigate to "Legal Resources" tab
   - Should see Federal + California + San Francisco resources

2. **Without Location:**
   - Clear city and state from profile
   - Navigate to "Legal Resources" tab
   - Should see Federal resources + prompt to add location

3. **Different Locations:**
   - Try different states: California, New York, Illinois, Texas
   - Try different cities: Los Angeles, San Francisco
   - Verify appropriate resources display

## Technical Details

- **TypeScript**: Fully typed for type safety
- **React**: Functional components with hooks
- **Lucide Icons**: For consistent iconography
- **Responsive Design**: Mobile-first approach
- **Performance**: Resources only fetched when section is accessed
- **No Breaking Changes**: Existing contact form still works

## Maintenance

### Updating Resources

When laws change or new agencies are added:
1. Edit `/src/data/legalResources.ts`
2. Update the relevant jurisdiction object
3. Test the changes locally
4. Deploy

### Monitoring

Consider adding:
- Analytics to track which resources are most accessed
- User feedback mechanism
- Regular legal review schedule (quarterly recommended)

## Support

If candidates have questions not covered by the resources, they can still use the "Contact Our Legal Partners" form at the bottom of the Legal Resources section.

---

**Implementation Date:** November 2024  
**Status:** ✅ Complete and Ready for Production  
**Requires:** User profile with city and state fields

