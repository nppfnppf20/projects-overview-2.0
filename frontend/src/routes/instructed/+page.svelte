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
      workStatus: existingReview?.workStatus || 'not started', // Keep existing work status
      // Add existing ID if updating
      ...(existingReview?.id ? { id: existingReview.id } : {}),
      // Update the specific date field that was changed
      [field]: value 
    };

    addOrUpdateReview(reviewData);
    // Trigger reactivity (store update should handle this, but explicit doesn't hurt)
    // Note: Direct mutation isn't needed here as the store update triggers reactivity.
  }
  
  // Function to handle work status change from dropdown
  function handleWorkStatusChange(quoteId: string, newStatus: WorkStatus) {
      if (!$selectedProject) return;
      updateWorkStatus(quoteId, $selectedProject.id, newStatus);
      // Note: Store update triggers reactivity.
  }
  
  // Work status options for dropdown
  const workStatuses: WorkStatus[] = ['not started', 'in progress', 'completed'];

</script>

<div class="instructed-container">
  <h1>Instructed Surveyors</h1>
  
  {#if $selectedProject}
    <div class="instructed-header">
      <h2>Surveyors for {$selectedProject.name}</h2>
    </div>
    
    {#if instructedQuotes.length > 0}
      <div class="table-container">
        <table class="surveyor-table">
          <thead>
            <tr>
              <th>Organisation</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Survey Type</th>
              <th>Total (ex. VAT)</th>
              <th>Site Visit</th>
              <th>Report Draft</th>
              <th>Status</th>
              <th>Actions</th>
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
                <td>£{quote.total.toFixed(2)}</td>
                <td>
                  <input 
                    type="date" 
                    class="date-input"
                    id="siteVisit-{quote.id}" 
                    value={review?.siteVisitDate || ''} 
                    on:change={(e) => handleDateUpdate(quote.id, 'siteVisitDate', e.currentTarget.value)}
                  />
                </td>
                <td>
                  <input 
                    type="date" 
                    class="date-input"
                    id="reportDraft-{quote.id}" 
                    value={review?.reportDraftDate || ''} 
                    on:change={(e) => handleDateUpdate(quote.id, 'reportDraftDate', e.currentTarget.value)}
                  />
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
                  <div class="action-buttons">
                    <button class="action-btn small-btn">View</button>
                    <button class="action-btn small-btn">Remind</button>
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

  .table-container {
    overflow-x: auto; /* Allows table to scroll horizontally if needed */
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .surveyor-table {
    width: 100%;
    border-collapse: collapse;
  }

  .surveyor-table th, 
  .surveyor-table td {
    padding: 0.8rem 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
    vertical-align: middle; /* Align content vertically */
    font-size: 0.9rem;
    white-space: nowrap; /* Prevent text wrapping initially */
  }

  .surveyor-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .surveyor-table tbody tr:last-child td {
    border-bottom: none;
  }
  
  .surveyor-table tbody tr:hover {
    background-color: #f1f3f5;
  }
  
  /* Highlight completed rows */
  .surveyor-table tbody tr.row-completed {
    background-color: #e6f7ec; /* Light green background */
    border-left: 5px solid #28a745; /* Green left border */
  }

  /* Ensure first cell aligns with border */
  .surveyor-table tbody tr.row-completed td:first-child {
     border-left: none; 
  }
    
  .surveyor-table tbody tr.row-completed:hover {
    background-color: #d1f0db; /* Slightly darker green on hover */
  }

  /* Input field styling within table */
  .date-input {
      padding: 0.3rem 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.9rem;
      width: 130px; /* Fixed width for date inputs */
  }
  
  .icon { /* Keep icon styles if used elsewhere, maybe adjust */
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
  
  /* Action buttons container */
  .action-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn { /* Keep base styles */
    padding: 0.4rem 0.75rem;
    border: none;
    border-radius: 4px;
    background-color: #6c757d;
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
    white-space: nowrap; /* Prevent button text wrapping */
  }
  
  .action-btn:hover {
    background-color: #5a6268;
  }
  
  /* Adjust button padding if needed */
  .small-btn {
      padding: 0.3rem 0.6rem;
      font-size: 0.8rem;
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
  
  /* Status Dropdown styling */
  .status-dropdown-container {
    position: relative; /* Allows absolute positioning of arrow */
    display: inline-block; /* Make it inline */
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
      text-align: left; /* Align text left */
      background-image: url('data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
      background-repeat: no-repeat;
      background-position: right 0.3rem center;
      background-size: 1.1em;
      box-sizing: border-box; /* Ensure padding is included in width */
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