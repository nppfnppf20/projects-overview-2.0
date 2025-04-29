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

export type InstructionStatus = 'pending' | 'not instructed' | 'partially instructed' | 'instructed';

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
    instructionStatus: 'not instructed', 
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

export function updateQuoteInstructionStatus(quoteId: string, newStatus: InstructionStatus) {
  allQuotes.update(quotes => 
    quotes.map(quote => 
      quote.id === quoteId ? { ...quote, instructionStatus: newStatus } : quote
    )
  );
}

// Function to potentially update other quote details later (e.g., from an edit modal)
export function updateQuote(quoteId: string, updatedData: Partial<Quote>) {
  allQuotes.update(quotes => 
    quotes.map(quote => 
      quote.id === quoteId ? { ...quote, ...updatedData } : quote
    )
  );
}

// --- Review Interface and Store ---
export interface SurveyorReview {
  id: string; 
  projectId: string; 
  quoteId: string; 
  quality?: number; // 1-5
  responsiveness?: number; // 1-5
  deliveredOnTime?: number; // Changed to number 0-5
  overallReview: number; // 1-5
  notes?: string; 
  reviewDate: string; 
}

// Store for all reviews
const initialReviews: SurveyorReview[] = [
    {
        id: 'rev1',
        projectId: 'project-1',
        quoteId: 'q2', 
        quality: 5,
        responsiveness: 4,
        deliveredOnTime: 5, // Changed to numeric rating
        overallReview: 4, 
        notes: 'Very professional and delivered on time.', 
        reviewDate: '2023-08-01'
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
                ...reviewData 
            };
            // Ensure ratings are within bounds (0-5)
            updatedReview.quality = Math.max(0, Math.min(5, updatedReview.quality || 0));
            updatedReview.responsiveness = Math.max(0, Math.min(5, updatedReview.responsiveness || 0));
            updatedReview.deliveredOnTime = Math.max(0, Math.min(5, updatedReview.deliveredOnTime || 0));
            updatedReview.overallReview = Math.max(1, Math.min(5, updatedReview.overallReview)); // Overall must be 1-5
            
            reviews[existingReviewIndex] = updatedReview;
            return [...reviews];
        } else {
            // Add new review, ensuring values are within bounds
            const newReview: SurveyorReview = {
                ...reviewData,
                id: `rev${Date.now()}`,
                quality: Math.max(0, Math.min(5, reviewData.quality || 0)),
                responsiveness: Math.max(0, Math.min(5, reviewData.responsiveness || 0)),
                deliveredOnTime: Math.max(0, Math.min(5, reviewData.deliveredOnTime || 0)),
                overallReview: Math.max(1, Math.min(5, reviewData.overallReview || 1)), // Default to 1 if not provided
                notes: reviewData.notes || ''
            };
            return [...reviews, newReview];
        }
    });
}

export function getReviewForQuote(quoteId: string): SurveyorReview | undefined {
    let review: SurveyorReview | undefined;
    allReviews.subscribe(reviews => { // Need to subscribe to get current value outside component
        review = reviews.find(r => r.quoteId === quoteId);
    })(); // Immediately unsubscribe
    return review;
} 