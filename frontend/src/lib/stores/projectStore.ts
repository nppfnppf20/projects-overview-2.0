import { writable } from 'svelte/store';

// --- Project Interface and Store ---
interface Project {
  id: string;
  name: string;
  // Basic Project Information
  clientName?: string;
  detailedDescription?: string;
  proposedUseDuration?: number;
  projectType?: 'solar' | 'bess' | 'solarBess' | 'other';
  address?: string;
  area?: number;
  localPlanningAuthority?: string;
  distributionNetwork?: string;
  siteDesignations?: string;
  
  // Equipment Specification (Solar)
  solarExportCapacity?: number;
  pvMaxPanelHeight?: number;
  fenceHeight?: number;
  pvClearanceFromGround?: number;
  numberOfSolarPanels?: number;
  panelTilt?: number;
  panelTiltDirection?: string;
  
  // Equipment Specification (BESS)
  bessExportCapacity?: number;
  bessContainers?: number;
  
  // Project Metrics
  gwhPerYear?: number;
  homesPowered?: number;
  co2Offset?: number;
  equivalentCars?: number;
  
  // Information for Surveyors
  accessArrangements?: string;
  accessContact?: string;
  parkingDetails?: string;
  atvUse?: 'yes' | 'no';
  additionalNotes?: string;
  invoicingDetails?: string;
}

const initialProjects: Project[] = [
  { id: 'project-1', name: 'Project Alpha' },
  { id: 'project-2', name: 'Project Beta' },
  { id: 'project-3', name: 'Project Gamma' }
];

export const projects = writable<Project[]>(initialProjects);
export const selectedProject = writable<Project | null>(
  initialProjects.length > 0 ? initialProjects[0] : null
);

export function addProject(name: string) {
  const id = `project-${Date.now()}`; 
  const newProject = { id, name };
  
  projects.update(existingProjects => {
    return [...existingProjects, newProject];
  });
  
  selectedProject.set(newProject);
  return newProject;
}

export function updateProject(projectId: string, updatedData: Partial<Project>) {
  let updated = false;
  
  projects.update(existingProjects => {
    return existingProjects.map(project => {
      if (project.id === projectId) {
        updated = true;
        const updatedProject = { ...project, ...updatedData };
        
        selectedProject.update(currentSelection => {
          if (currentSelection && currentSelection.id === projectId) {
            return updatedProject;
          }
          return currentSelection;
        });
        
        return updatedProject;
      }
      return project;
    });
  });
  
  return updated;
}

export function selectProjectById(id: string) {
  let found = false;
  
  projects.update(existingProjects => {
    const project = existingProjects.find(p => p.id === id);
    if (project) {
      selectedProject.set(project);
      found = true;
    }
    return existingProjects;
  });
  
  return found;
}

export function selectProjectByName(name: string) {
  let found = false;
  
  projects.update(existingProjects => {
    const project = existingProjects.find(p => p.name === name);
    if (project) {
      selectedProject.set(project);
      found = true;
    }
    return existingProjects;
  });
  
  return found;
}

// --- Quote Interface and Store ---
export interface LineItem {
  description: string;
  cost: number;
}

export type InstructionStatus = 'pending' | 'will not be instructed' | 'partially instructed' | 'instructed';

export interface Quote {
  id: string;
  projectId: string;
  discipline: string;
  surveyType?: string; // Made optional
  organisation: string;
  contactName: string;
  email?: string; // Made optional
  lineItems: LineItem[]; // Store full line items
  total: number;
  instructionStatus: InstructionStatus;
  partiallyInstructedTotal?: number; // New: Store total if partially instructed
  additionalNotes?: string; // Added from modal
  status?: string; // Internal status, maybe useful later
  date?: string; // Optional date field
}

const initialQuotes: Quote[] = [
  { 
    id: 'q1', 
    projectId: 'project-1', 
    discipline: 'Ecology',
    surveyType: 'Preliminary Ecological Appraisal',
    organisation: 'EcoSurveys Ltd',
    contactName: 'John Smith',
    email: 'john.smith@ecosurveys.com',
    lineItems: [{description: 'Desk Study', cost: 400}, {description: 'Site Visit', cost: 600}, {description: 'Report', cost: 200}],
    total: 1200,
    instructionStatus: 'will not be instructed', 
    status: 'pending',
    date: '2023-05-15' 
  },
  { 
    id: 'q2', 
    projectId: 'project-1', 
    discipline: 'Landscape',
    surveyType: 'Landscape and Visual Impact Assessment',
    organisation: 'Vista Landscapes',
    contactName: 'Jane Doe',
    email: 'jane.doe@vistalandscapes.com',
    lineItems: [{description: 'LVIA Report', cost: 700}, {description: 'Visualisations', cost: 280}],
    total: 980,
    instructionStatus: 'instructed',
    status: 'accepted',
    date: '2023-05-14' 
  },
  { 
    id: 'q3', 
    projectId: 'project-2', 
    discipline: 'Noise',
    surveyType: 'Noise Impact Assessment',
    organisation: 'Acoustic Consultants',
    contactName: 'Robert Johnson',
    email: 'r.johnson@acousticconsultants.com',
    lineItems: [{description: 'Baseline Survey', cost: 500}, {description: 'Modeling', cost: 600}, {description: 'Reporting', cost: 350}],
    total: 1450,
    instructionStatus: 'pending',
    status: 'rejected',
    date: '2023-05-13' 
  }
];

export const allQuotes = writable<Quote[]>(initialQuotes);

export function addQuote(quoteData: Omit<Quote, 'id' | 'total'>) {
  const total = quoteData.lineItems.reduce((sum, item) => sum + item.cost, 0);
  const newQuote: Quote = {
    ...quoteData,
    id: `q${Date.now()}`,
    total: total,
  };
  
  allQuotes.update(quotes => [...quotes, newQuote]);
}

export function updateQuoteInstructionStatus(quoteId: string, newStatus: InstructionStatus, partialTotal?: number) {
  allQuotes.update(quotes => 
    quotes.map(quote => {
      if (quote.id === quoteId) {
        const updatedQuote = { 
          ...quote, 
          instructionStatus: newStatus,
          // Set or clear the partial total based on the new status
          partiallyInstructedTotal: newStatus === 'partially instructed' ? partialTotal : undefined
        };
        return updatedQuote;
      } 
      return quote;
    })
  );
}

export function updateQuote(quoteId: string, updatedData: Partial<Quote>) {
  allQuotes.update(quotes => 
    quotes.map(quote => 
      quote.id === quoteId ? { ...quote, ...updatedData } : quote
    )
  );
}

export function deleteQuote(quoteId: string) {
  allQuotes.update(quotes => quotes.filter(quote => quote.id !== quoteId));
  // In a real app, you would also need to delete related reviews, etc.
}

// --- Review Interface and Store ---
export type WorkStatus = 'in progress' | 'completed' | 'not started';

// New interface for uploaded work details
export interface UploadedWork {
  fileName: string;
  title: string;
  version: string;
  dateUploaded: string;
  description?: string;
  url?: string; // New: Add a field for the file URL/path (placeholder for now)
}

export interface SurveyorReview {
  id: string; // Unique review ID (e.g., `rev-${Date.now()}`)
  projectId: string; // Link to project
  quoteId: string; // Link to the specific quote being reviewed
  quality?: number; // 1-5
  responsiveness?: number; // 1-5
  deliveredOnTime?: number; // 0-5
  overallReview: number; // 1-5
  notes?: string; // For review comments (reviews page)
  operationalNotes?: string; // For operational/progress notes (instructed page)
  reviewDate: string; // ISO date string (YYYY-MM-DD)
  siteVisitDate?: string; // ISO date string (YYYY-MM-DD)
  reportDraftDate?: string; // ISO date string (YYYY-MM-DD)
  workStatus?: WorkStatus; // New: Track work progress
  uploadedWorks?: UploadedWork[]; // New: Array to store uploaded work details
}

// Store for all reviews
const initialReviews: SurveyorReview[] = [
    {
        id: 'rev1',
        projectId: 'project-1',
        quoteId: 'q2', 
        quality: 5,
        responsiveness: 4,
        deliveredOnTime: 5, 
    overallReview: 5, 
    notes: 'Excellent work, very thorough and delivered ahead of schedule.', 
    operationalNotes: 'Site visit complete. Report draft expected next week.',
    reviewDate: '2023-06-01',
    siteVisitDate: '2023-05-20',
    reportDraftDate: '2023-05-28',
    workStatus: 'completed',
    uploadedWorks: [
        { fileName: 'LVIA_Report_v1.pdf', title: 'LVIA Report', version: '1.0', dateUploaded: '2023-05-28', description: 'Initial Draft', url: '/placeholder/LVIA_Report_v1.pdf' }
    ]
    }
];

export const allReviews = writable<SurveyorReview[]>(initialReviews);

export function addOrUpdateReview(reviewData: Omit<SurveyorReview, 'id'> & { id?: string }) {
    allReviews.update(reviews => {
        const existingReviewIndex = reviews.findIndex(r => r.quoteId === reviewData.quoteId);
        
        if (existingReviewIndex !== -1) {
            // Update existing review
            const updatedReview = { 
        ...reviews[existingReviewIndex], 
                ...reviewData,
        // Ensure ID is preserved
        id: reviews[existingReviewIndex].id 
      };
            reviews[existingReviewIndex] = updatedReview;
      console.log('Updated review:', updatedReview);
        } else {
      // Add new review
            const newReview: SurveyorReview = {
        ...reviewData,
        id: `rev-${Date.now()}`,
        // Ensure required fields have defaults if not provided in reviewData
        // Note: The calling functions should ideally provide defaults, but this is a safeguard
        quality: reviewData.quality ?? undefined, 
        responsiveness: reviewData.responsiveness ?? undefined, 
        deliveredOnTime: reviewData.deliveredOnTime ?? undefined, 
        overallReview: reviewData.overallReview ?? 1, // Default overall if not set
        notes: reviewData.notes ?? undefined,
        operationalNotes: reviewData.operationalNotes ?? undefined,
        reviewDate: reviewData.reviewDate ?? new Date().toISOString().split('T')[0],
        siteVisitDate: reviewData.siteVisitDate ?? undefined,
        reportDraftDate: reviewData.reportDraftDate ?? undefined,
        workStatus: reviewData.workStatus ?? 'not started',
        uploadedWorks: reviewData.uploadedWorks ?? [],
            };
      reviews.push(newReview);
      console.log('Added new review:', newReview);
        }
    return reviews;
    });
}

export function getReviewForQuote(quoteId: string): SurveyorReview | undefined {
    let review: SurveyorReview | undefined;
    allReviews.subscribe(reviews => { // Need to subscribe to get current value outside component
        review = reviews.find(r => r.quoteId === quoteId);
    })(); // Immediately unsubscribe
    return review;
}

// Specific function to update only the work status
export function updateWorkStatus(quoteId: string, projectId: string, workStatus: WorkStatus) {
    const existingReview = getReviewForQuote(quoteId);
    const reviewData: Omit<SurveyorReview, 'id'> & { id?: string } = {
        quoteId: quoteId,
        projectId: projectId,
        workStatus: workStatus,
        // Provide defaults or existing values for other fields if review doesn't exist
        overallReview: existingReview?.overallReview ?? 0,
        reviewDate: existingReview?.reviewDate ?? new Date().toISOString().split('T')[0],
        // Include other existing fields
        ...(existingReview ? { 
            quality: existingReview.quality,
            responsiveness: existingReview.responsiveness,
            deliveredOnTime: existingReview.deliveredOnTime,
            notes: existingReview.notes,
            siteVisitDate: existingReview.siteVisitDate,
            reportDraftDate: existingReview.reportDraftDate,
            id: existingReview.id // Pass ID if updating existing
         } : {})
    };
    addOrUpdateReview(reviewData);
}

// Function to add uploaded work details to a review
export function addUploadedWork(quoteId: string, projectId: string, workDetails: UploadedWork) {
  allReviews.update(reviews => {
    const reviewIndex = reviews.findIndex(r => r.quoteId === quoteId && r.projectId === projectId);
    
    if (reviewIndex !== -1) {
      // Review exists, update it
      const updatedReview = { ...reviews[reviewIndex] };
      // Prepend the new work details to the beginning of the array
      updatedReview.uploadedWorks = [workDetails, ...(updatedReview.uploadedWorks || [])];
      reviews[reviewIndex] = updatedReview;
    } else {
      // Review doesn't exist, create a new one
      const newReview: SurveyorReview = {
        id: `rev-${Date.now()}`,
        projectId,
        quoteId,
        overallReview: 0, // Default overall review
        reviewDate: new Date().toISOString().split('T')[0], // Default review date
        workStatus: 'in progress', // Default status when work is uploaded
        uploadedWorks: [workDetails] // Start the array with the new work
        // Add other default fields as necessary
      };
      reviews.push(newReview);
    }
    return reviews;
  });
}

// --- Programme Event Interface and Store ---
export interface ProgrammeEvent {
  id: string; // Unique event ID (e.g., `evt-${Date.now()}`)
  projectId: string; // Link to project
  title: string; // Description of the key date
  date: string; // ISO date string (YYYY-MM-DD)
  color: string; // Hex color code (e.g., #ff0000)
}

// Store for all programme events
const initialProgrammeEvents: ProgrammeEvent[] = [
    // Add initial dummy events if needed, linking to projectIds
    {
        id: 'evt1',
        projectId: 'project-1',
        title: 'Initial Site Assessment Due',
        date: '2023-11-15', // Example date - adjust if needed
        color: '#007bff' // Blue
    },
    {
        id: 'evt2',
        projectId: 'project-1',
        title: 'Planning Submission Target',
        date: '2023-11-30',
        color: '#ffc107' // Yellow
    },
     {
        id: 'evt3',
        projectId: 'project-2',
        title: 'Grid Connection Offer Deadline',
        date: '2023-12-10',
        color: '#dc3545' // Red
    }
];

export const allProgrammeEvents = writable<ProgrammeEvent[]>(initialProgrammeEvents);

export function addProgrammeEvent(event: Omit<ProgrammeEvent, 'id'>) {
  // Use a simple timestamp-based ID for now
  const newEvent = { ...event, id: `evt-${Date.now()}` }; 
  allProgrammeEvents.update(events => [...events, newEvent]);
}

// Function to update an existing programme event
export function updateProgrammeEvent(updatedEvent: ProgrammeEvent) {
  allProgrammeEvents.update(events => 
    events.map(event => (event.id === updatedEvent.id ? updatedEvent : event))
  );
}

// Function to delete a programme event by ID
export function deleteProgrammeEvent(eventId: string) {
  allProgrammeEvents.update(events => events.filter(event => event.id !== eventId));
} 