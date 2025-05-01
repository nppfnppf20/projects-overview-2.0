<script lang="ts">
  import {
    selectedProject, 
    allQuotes, 
    allReviews, 
    addOrUpdateReview, // Use this to update dates
    updateWorkStatus, // Import the new function
    type Quote, 
    type SurveyorReview, 
    type WorkStatus // Import the status type
  } from "$lib/stores/projectStore";
  
  // MODIFIED: Filter for instructed OR partially instructed quotes
  $: instructedQuotes = $selectedProject 
    ? $allQuotes.filter(quote => 
        quote.projectId === $selectedProject.id && 
        (quote.instructionStatus === 'instructed' || quote.instructionStatus === 'partially instructed')
      ) 
    : [];

  // Helper to find review for a quote reactively
  function findReview(quoteId: string): SurveyorReview | undefined {
      return $allReviews.find(r => r.quoteId === quoteId);
  }

  // Function to handle date updates directly from the table
  function handleDateUpdate(quoteId: string, field: 'siteVisitDate' | 'reportDraftDate', value: string) {
    if (!$selectedProject) return;

    const existingReview = findReview(quoteId);

    // Prepare data for the update/add function
    // Ensures we don't overwrite other review fields if they exist
    const reviewData: Omit<SurveyorReview, 'id'> & { id?: string } = {
      projectId: $selectedProject.id,
      quoteId: quoteId,
      // Include existing values or defaults
      quality: existingReview?.quality,
      responsiveness: existingReview?.responsiveness,
      deliveredOnTime: existingReview?.deliveredOnTime,
      overallReview: existingReview?.overallReview || 0, // Default 0 if no review yet
      notes: existingReview?.notes,
      reviewDate: existingReview?.reviewDate || new Date().toISOString().split('T')[0],
      siteVisitDate: existingReview?.siteVisitDate,
      reportDraftDate: existingReview?.reportDraftDate,
      // Add existing ID if updating
      ...(existingReview?.id ? { id: existingReview.id } : {}),
      // Update the specific date field that was changed
      [field]: value 
    };

    addOrUpdateReview(reviewData);
    // Trigger reactivity for the table (though store update should suffice)
    instructedQuotes = [...instructedQuotes]; 
  }
  
  // Function to handle work status change from dropdown
  function handleWorkStatusChange(quoteId: string, newStatus: WorkStatus) {
      if (!$selectedProject) return;
      updateWorkStatus(quoteId, $selectedProject.id, newStatus);
  }
  
  // Work status options for dropdown
  const workStatuses: WorkStatus[] = ['not started', 'in progress', 'completed'];

</script>

<div class="instructed-container">
  <h1>Instructed Surveyors</h1>
  
  {#if $selectedProject}
    <div class="instructed-header">
      <h2>Surveyors for {$selectedProject.name}</h2>
      <!-- Button removed as instruction happens on Quotes page -->
    </div>
    
    {#if instructedQuotes.length > 0}
      <div class="survey-cards">
        {#each instructedQuotes as quote (quote.id)}
          {@const review = findReview(quote.id)}
          {@const currentWorkStatus = review?.workStatus || 'not started'}
          <div 
            class="surveyor-card"
            class:card-completed={currentWorkStatus === 'completed'}
          >
            <div class="card-header">
              <h3>{quote.organisation}</h3>
              <!-- Dropdown styled as pill -->
              <div class="status-dropdown-container">
                 <select 
                    class="work-status-select {currentWorkStatus.replace(/\s+/g, '-')}" 
                    value={currentWorkStatus} 
                    on:change={(e) => handleWorkStatusChange(quote.id, e.currentTarget.value as WorkStatus)}
                  >
                    {#each workStatuses as status}
                      <option value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    {/each}
                 </select>
              </div>
            </div>
            
            <div class="card-content">
              <div class="surveyor-detail">
                <i class="icon">👤</i>
                <span>{quote.contactName}</span>
              </div>
              {#if quote.email}
                <div class="surveyor-detail">
                  <i class="icon">📧</i>
                  <span><a href="mailto:{quote.email}">{quote.email}</a></span>
                </div>
              {/if}
              <div class="surveyor-detail">
                <i class="icon">📝</i>
                <span>{quote.surveyType || 'N/A'}</span>
              </div>
              <div class="surveyor-detail">
                <i class="icon">💰</i>
                <span>£{quote.total.toFixed(2)} (excl. VAT)</span>
              </div>
              
              <!-- Dates Section -->
              <hr class="divider" />
              <div class="dates-section">
                <h4>Dates</h4>
                <div class="date-input-group">
                    <label for="siteVisit-{quote.id}">Site Visit:</label>
                    <input 
                        type="date" 
                        id="siteVisit-{quote.id}" 
                        value={review?.siteVisitDate || ''} 
                        on:change={(e) => handleDateUpdate(quote.id, 'siteVisitDate', e.currentTarget.value)}
                    />
                </div>
                 <div class="date-input-group">
                    <label for="reportDraft-{quote.id}">Report First Draft:</label>
                    <input 
                        type="date" 
                        id="reportDraft-{quote.id}" 
                        value={review?.reportDraftDate || ''} 
                        on:change={(e) => handleDateUpdate(quote.id, 'reportDraftDate', e.currentTarget.value)}
                    />
                </div>
              </div>
            </div>
            
            <div class="card-footer">
              <button class="action-btn">View Details</button>
              <button class="action-btn">Send Reminder</button>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="no-data-message">No surveyors have been marked as instructed for this project yet.</p>
    {/if}
    
  {:else}
    <p>Please select a project to view instructed surveyors.</p>
  {/if}
</div>

<style>
  .instructed-container {
    padding: 1rem 0;
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .instructed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  h2 {
    font-size: 1.5rem;
    color: #555;
    margin: 0;
  }
  
  .survey-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }
  
  .surveyor-card {
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: background-color 0.3s ease;
  }
  
  .surveyor-card.card-completed {
    background-color: #e6f7ec;
    border-left: 5px solid #28a745;
  }
  
  .card-header {
    padding: 1rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  h3 {
    margin: 0;
    color: #495057;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .status-badge {
    /* Removed as it was specific to the old static badge */
  }
  
  .status-instructed {
    /* Removed as it was specific to the old static badge */
  }
  
  .card-content {
    padding: 1rem;
    flex-grow: 1;
    display: flex; /* Allow column layout */
    flex-direction: column;
  }
  
  .surveyor-detail {
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
  }
  
  .surveyor-detail:last-of-type {
      margin-bottom: 0; 
  }

  .divider {
      border: 0;
      border-top: 1px solid #eee;
      margin: 1rem 0;
  }

  .dates-section {
      margin-top: auto; /* Push dates to the bottom */
      padding-top: 1rem; /* Add space above dates */
  }
  
  .dates-section h4 {
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #495057;
  }

  .date-input-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
  }
  
  .date-input-group label {
      flex-basis: 140px; /* Fixed width for labels */
      flex-shrink: 0;
      font-size: 0.9rem;
  }
  
  .date-input-group input[type="date"] {
      flex-grow: 1;
      padding: 0.3rem 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.9rem;
  }

  .icon {
    font-style: normal;
    font-size: 1.1rem;
    width: 1.2em;
    text-align: center;
  }
  
  a {
    color: #007bff;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  
  .card-footer {
    padding: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  
  .action-btn {
    padding: 0.4rem 0.75rem;
    border: none;
    border-radius: 4px;
    background-color: #6c757d;
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .action-btn:hover {
    background-color: #5a6268;
  }
  
  .no-data-message {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
    background-color: #f8f9fa;
    border: 1px dashed #ced4da;
    border-radius: 5px;
    margin-top: 1rem;
  }
  
  .status-dropdown-container {
    position: relative; /* Allows absolute positioning of arrow */
  }

  .work-status-select {
      /* Appearance reset */
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      /* Pill styling */
      display: inline-block;
      padding: 0.3rem 1.5rem 0.3rem 0.8rem; /* Extra padding right for arrow space */
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: capitalize;
      border: none; 
      cursor: pointer;
      line-height: 1.2;
      /* Default state */
      background-color: #6c757d; /* Default grey */
      color: white;
      min-width: 110px; /* Ensure minimum width */
      text-align: center;
      background-image: url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
      background-repeat: no-repeat;
      background-position: right 0.3rem center;
      background-size: 1.1em;
  }
  
  /* Color overrides based on status */
  .work-status-select.not-started {
      background-color: #6c757d; /* Grey */
  }
  .work-status-select.in-progress {
      background-color: #007bff; /* Blue */
  }
  .work-status-select.completed {
      background-color: #28a745; /* Green */
  }

  .work-status-select:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
  }
</style> 