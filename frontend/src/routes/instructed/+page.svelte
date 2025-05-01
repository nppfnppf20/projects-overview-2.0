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
  import NotesModal from "$lib/components/NotesModal.svelte"; // Import the new modal
  
  // Modal state for Notes
  let showNotesModal = false;
  let currentQuoteForNotes: Quote | null = null;
  let currentNotes: string | undefined = '';

  // Filter for instructed quotes based on selected project
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

  // --- Notes Modal Functions ---
  function openNotesModal(quote: Quote, review: SurveyorReview | undefined) {
    currentQuoteForNotes = quote;
    currentNotes = review?.notes;
    showNotesModal = true;
  }

  function closeNotesModal() {
    showNotesModal = false;
    currentQuoteForNotes = null;
    currentNotes = '';
  }

  function handleSaveNotes(event: CustomEvent<{ notes: string }>) {
    if (!$selectedProject || !currentQuoteForNotes) return;
    
    const newNotes = event.detail.notes;
    const existingReview = findReview(currentQuoteForNotes.id);
    
    const reviewData: Omit<SurveyorReview, 'id'> & { id?: string } = {
      projectId: $selectedProject.id,
      quoteId: currentQuoteForNotes.id,
      notes: newNotes, // Update notes
      // Provide defaults or existing values for other fields
      quality: existingReview?.quality,
      responsiveness: existingReview?.responsiveness,
      deliveredOnTime: existingReview?.deliveredOnTime,
      overallReview: existingReview?.overallReview ?? 0,
      reviewDate: existingReview?.reviewDate ?? new Date().toISOString().split('T')[0],
      siteVisitDate: existingReview?.siteVisitDate,
      reportDraftDate: existingReview?.reportDraftDate,
      workStatus: existingReview?.workStatus,
      ...(existingReview?.id ? { id: existingReview.id } : {}),
    };

    addOrUpdateReview(reviewData);
    closeNotesModal();
  }

  // Helper function to get the first line of notes or a placeholder
  function getNotesPreview(notes: string | undefined): string {
    if (!notes || notes.trim() === '') {
      return "Add notes...";
    }
    return notes.split('\n')[0]; // Get first line
  }
</script>

<div class="instructed-container">
  <h1>Instructed Surveyors</h1>
  
  {#if $selectedProject}
    <div class="instructed-header">
      <h2>Surveyors for {$selectedProject.name}</h2>
    </div>
    
    {#if instructedQuotes.length > 0}
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Organisation</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Survey Type</th>
              <th>Quote Amt.</th>
              <th>Work Status</th>
              <th>Site Visit</th>
              <th>Report Draft</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {#each instructedQuotes as quote (quote.id)}
              {@const review = findReview(quote.id)}
              {@const currentWorkStatus = review?.workStatus || 'not started'}
              <tr class:row-completed={currentWorkStatus === 'completed'}>
                <td>{quote.organisation}</td>
                <td>{quote.contactName}</td>
                <td>
                  {#if quote.email}
                    <a href="mailto:{quote.email}">{quote.email}</a>
                  {:else}
                    N/A
                  {/if}
                </td>
                <td>{quote.surveyType || 'N/A'}</td>
                <td>
                  {#if quote.instructionStatus === 'partially instructed' && quote.partiallyInstructedTotal !== undefined}
                    £{quote.partiallyInstructedTotal.toFixed(2)} (Partial)
                  {:else}
                    £{quote.total.toFixed(2)}
                  {/if}
                </td>
                <td>
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
                </td>
                <td>
                  <input
                      type="date"
                      class="date-input"
                      value={review?.siteVisitDate || ''}
                      on:change={(e) => handleDateUpdate(quote.id, 'siteVisitDate', e.currentTarget.value)}
                  />
                </td>
                <td>
                  <input
                      type="date"
                      class="date-input"
                      value={review?.reportDraftDate || ''}
                      on:change={(e) => handleDateUpdate(quote.id, 'reportDraftDate', e.currentTarget.value)}
                  />
                </td>
                <td>
                  <!-- Notes Cell - Clickable area -->
                  <div 
                    class="notes-preview {review?.notes ? 'has-notes' : 'no-notes'}"
                    on:click={() => openNotesModal(quote, review)}
                    role="button"
                    tabindex="0"
                    title={review?.notes ? "Click to edit notes" : "Click to add notes"}
                    on:keypress={(e) => { if (e.key === 'Enter') openNotesModal(quote, review); }}
                  >
                    {getNotesPreview(review?.notes)}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <p class="no-data-message">No surveyors have been marked as instructed for this project yet.</p>
    {/if}
    
  {:else}
    <p>Please select a project to view instructed surveyors.</p>
  {/if}
</div>

<!-- Notes Modal Instance -->
{#if showNotesModal && currentQuoteForNotes}
  <NotesModal 
    initialNotes={currentNotes} 
    organisationName={currentQuoteForNotes.organisation}
    on:save={handleSaveNotes}
    on:cancel={closeNotesModal}
  />
{/if}

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
  
  /* Table Styles */
  .table-container {
      overflow-x: auto; /* Add horizontal scroll for smaller screens */
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-radius: 5px;
    overflow: hidden; /* Ensures border-radius applies to table */
  }

  th, td {
    padding: 0.8rem 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
    font-size: 0.9rem;
    vertical-align: middle; /* Align content vertically */
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
    white-space: nowrap; /* Prevent headers from wrapping */
  }

  tbody tr:hover {
    background-color: #f1f3f5;
  }

  tbody tr.row-completed {
      background-color: #e6f7ec; /* Light green for completed rows */
      border-left: 4px solid #28a745;
  }

  tbody tr.row-completed:hover {
      background-color: #d4edda; /* Slightly darker green on hover */
  }

  td {
    color: #333;
  }

  td a {
    color: #007bff;
    text-decoration: none;
  }

  td a:hover {
    text-decoration: underline;
  }

  /* Input/Select Styling within Table */
  .date-input {
      padding: 0.3rem 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.9rem;
      width: 120px; /* Fixed width for date inputs */
  }

  .status-dropdown-container {
    /* Container doesn't need special styling now */
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

  /* Action Buttons in Table */
  .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-start; /* Align buttons left in the cell */
  }

  .action-btn {
    padding: 0.4rem 0.75rem;
    border: none;
    border-radius: 4px;
    background-color: #6c757d;
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
    white-space: nowrap; /* Prevent button text wrapping */
  }

  .action-btn.small {
      font-size: 0.8rem;
      padding: 0.3rem 0.6rem;
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

  /* Remove old card styles */
  .survey-cards, .surveyor-card, .card-header, .card-content, .card-footer, .surveyor-detail, .icon, .divider, .dates-section, .date-input-group {
      /* These styles are no longer needed */
      display: none; /* Or simply remove these rules */
  }

  /* Notes Preview Styles */
  .notes-preview {
    cursor: pointer;
    padding: 0.4rem 0.6rem;
    border: 1px dashed #ced4da; /* Dashed border to look editable */
    border-radius: 4px;
    background-color: #f8f9fa;
    color: #6c757d; /* Grey text for placeholder */
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; /* Show ellipsis if text overflows */
    display: block; /* Ensure it behaves as a block for overflow */
    max-width: 250px; /* Explicitly set a max width */
    transition: background-color 0.2s, border-color 0.2s;
  }

  .notes-preview.has-notes {
    border-style: solid; /* Solid border if notes exist */
    background-color: #fff; /* White background for actual notes */
    color: #333; /* Darker text for actual notes */
  }

  .notes-preview:hover, 
  .notes-preview:focus {
    background-color: #e9ecef;
    border-color: #adb5bd;
    outline: none;
  }

</style> 