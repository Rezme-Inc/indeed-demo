# LA Fair Chance Initiative Assessment

## Overview

The LA Fair Chance Initiative assessment is a structured evaluation process that helps employers make fair and compliant hiring decisions regarding candidates with criminal histories. The assessment follows the guidelines set forth by the LA Fair Chance Initiative ordinance.

## Assessment Flow

### Step 1: Conditional Offer

- Question: "Has a conditional offer of employment been made to the candidate?"
- Options: Yes/No
- If "No" is selected, the assessment ends as a conditional offer must be made before proceeding with the assessment.

### Step 2: Criminal History (if conditional offer is "Yes")

- Question: "Does the candidate have a criminal history?"
- Options: Yes/No
- If "No" is selected, the assessment proceeds to completion.

### Step 3: Conviction Details (if criminal history is "Yes")

The following questions are only shown if the candidate has a criminal history:

1. **Conviction Type**

   - Question: "If yes, what type of conviction?"
   - Options: Felony, Misdemeanor, Infraction

2. **Conviction Age**

   - Question: "How old is the conviction?"
   - Options:
     - Less than 1 year
     - 1-3 years
     - 3-5 years
     - More than 5 years

3. **Job Relatedness**

   - Question: "Is the conviction directly related to the job?"
   - Options: Yes/No

4. **Rehabilitation**

   - Question: "Has the candidate shown evidence of rehabilitation?"
   - Options: Yes/No/Not Applicable

5. **Time Elapsed**
   - Question: "Has sufficient time elapsed since the conviction?"
   - Options: Yes/No/Not Applicable

## Decision Logic

The assessment automatically determines the outcome based on the following criteria:

### Review Required (if any of the following are true):

1. No conditional offer has been made
2. Recent felony conviction (less than 1 year old)
3. Conviction is directly related to the job
4. No evidence of rehabilitation
5. Insufficient time elapsed since conviction

### Proceed (if none of the above conditions are met):

- The assessment indicates that the employer may proceed with the hiring process

## Technical Implementation

### Key Features

1. **Conditional Question Display**

   - Questions are only shown if their dependencies are met
   - Previous answers determine which questions are relevant

2. **Navigation**

   - Users can move forward and backward through the assessment
   - Previous answers are preserved when navigating
   - Next button is only enabled when current question is answered

3. **State Management**

   - All answers are tracked in state
   - Assessment progress is maintained
   - Final decision is calculated based on all answers

4. **User Interface**
   - Clean, professional design
   - Clear question presentation
   - Intuitive navigation
   - Responsive layout

### File Structure

- Location: `src/app/hr-admin/dashboard/[userId]/assessment/page.tsx`
- Component: Client-side React component
- State: Uses React useState for managing answers and progress

## Usage

1. Access the assessment through the HR admin dashboard
2. Answer each question as it appears
3. Use the navigation buttons to move between questions
4. Add any additional notes at the end
5. Complete the assessment to receive the decision

## Future Improvements

1. Add ability to save and resume assessments
2. Implement assessment history tracking
3. Add detailed reporting features
4. Include more comprehensive documentation of decisions
5. Add support for multiple assessment types
