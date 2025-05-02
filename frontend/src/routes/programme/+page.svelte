<script lang="ts">
  import {
    selectedProject, 
    allProgrammeEvents, 
    addProgrammeEvent,
    type ProgrammeEvent,
    allQuotes,
    type Quote,
    getReviewForQuote,
    type SurveyorReview
  } from "$lib/stores/projectStore";
  import { onMount } from 'svelte';
  // import { Calendar } from '@fullcalendar/core'; // Removed
  // import dayGridPlugin from '@fullcalendar/daygrid'; // Removed
  // import interactionPlugin from '@fullcalendar/interaction'; // Removed
  // import KeyDateModal from '$lib/components/KeyDateModal.svelte'; // Removed
  import { derived } from 'svelte/store';
  import { startOfWeek, addMonths, addWeeks, format, isBefore, min, parseISO, isWithinInterval, endOfWeek } from 'date-fns';
  
  // CSS imports removed from here

  // let calendarEl: HTMLElement; // Removed
  // let calendar: Calendar; // Removed

  // Modal State - Removed
  // let showKeyDateModal = false; 
  // let selectedDateStr: string | null = null; 

  // Filter programme events for the current project
  // Simplified - no longer mapping to FullCalendar format
  const currentProjectEvents = derived(
    [allProgrammeEvents, selectedProject],
    ([$allProgrammeEvents, $selectedProject]) => {
      if (!$selectedProject) return [];
      // Keep filtering, remove mapping to FullCalendar format
      return $allProgrammeEvents.filter(event => event.projectId === $selectedProject.id); 
    }
  );

  // Filter instructed/partially instructed surveyors (quotes) for the current project
  const instructedSurveyors = derived(
    [allQuotes, selectedProject],
    ([$allQuotes, $selectedProject]): Quote[] => {
      if (!$selectedProject) return [];
      return $allQuotes.filter(quote => 
        quote.projectId === $selectedProject.id &&
        (quote.instructionStatus === 'instructed' || quote.instructionStatus === 'partially instructed')
      );
    }
  );

  // onMount block related to calendar removed
  /*
  onMount(() => {
    calendar = new Calendar(calendarEl, {
      // ... calendar config ...
    });

    calendar.render();

    const unsubscribe = currentProjectEvents.subscribe(events => {
      // ... update calendar ...
    });

    return () => {
      calendar.destroy();
      unsubscribe(); 
    };
  });
  */

  // Calendar/Modal related functions removed
  /*
  function handleDateSelect(selectInfo: { startStr: string, endStr: string, allDay: boolean }) {
      // ... logic ...
  }

  function handleEventClick(clickInfo: { event: any }) {
    // ... logic ...
  }
  
  function handleModalSave(event: CustomEvent<{ title: string; date: string; color: string }>) {
     // ... logic ...
  }

  function handleModalCancel() {
      // ... logic ...
  }
  */

  // --- Timeline Calculation ---
  let timelineStartDate: Date = new Date(); // Default to today
  let timelineEndDate: Date = addMonths(timelineStartDate, 4); // Initial 4 months
  let weeks: Date[] = [];

  // Reactive calculation for dates and weeks
  $: {
    const today = new Date();
    // let earliestEventDate: Date | null = null; // No longer needed for start date

    // Keep this logic if needed elsewhere, but not for start date calculation
    /*
    if ($currentProjectEvents.length > 0) {
      const eventDates = $currentProjectEvents.map(event => parseISO(event.date));
      earliestEventDate = min(eventDates);
    }
    */

    // Determine start date: Always use today's date
    // const potentialStartDate = earliestEventDate ? min([today, earliestEventDate]) : today; // Old logic
    const potentialStartDate = today; // New logic: always start from today
    
    // Ensure start date isn't recalculated when extending range, only on project/event changes
    // We only calculate the *initial* start date reactively based on events/today.
    // If timelineStartDate is already set (e.g., by initial load), don't change it unless project changes.
    if (weeks.length === 0 || !$selectedProject) { // Initialize or reset on project change
         timelineStartDate = startOfWeek(potentialStartDate, { weekStartsOn: 1 }); 
         timelineEndDate = addMonths(timelineStartDate, 4); // Reset range on project change
    }

    // Generate weeks based on current timelineStartDate and timelineEndDate
    const generatedWeeks: Date[] = [];
    let currentWeek = timelineStartDate;
    while (isBefore(currentWeek, timelineEndDate)) {
      generatedWeeks.push(currentWeek);
      currentWeek = addWeeks(currentWeek, 1);
    }
    weeks = generatedWeeks;
  }

  // Function to format week date for display
  function formatWeekHeader(date: Date): string {
    return `w/c ${format(date, 'd MMM')}`; 
  }

  // Function to extend timeline by one month
  function extendTimeline() {
    timelineEndDate = addMonths(timelineEndDate, 1);
    // The reactive block `$: { ... }` will automatically update the `weeks` array
  }

  // Function to check if a date string falls within a given week
  function isDateInWeek(dateStr: string | undefined | null, weekStartDate: Date): boolean {
      if (!dateStr) return false;
      try {
          const date = parseISO(dateStr);
          const weekInterval = { 
              start: weekStartDate, 
              // Get the end of the week (Sunday) based on the week starting Monday
              end: endOfWeek(weekStartDate, { weekStartsOn: 1 }) 
          };
          return isWithinInterval(date, weekInterval);
      } catch (e) {
          console.error("Error parsing date:", dateStr, e);
          return false;
      }
  }

</script>

<div class="programme-container">
  <h1>Programme</h1>
  
  {#if $selectedProject}
    <div class="programme-header">
      <h2>Timeline for {$selectedProject.name}</h2>
    </div>
    
    <div class="programme-content timeline-view">
      {#if $instructedSurveyors.length > 0}
        <table class="timeline-table">
          <thead>
            <tr>
              <th class="sticky-col header-cell">Surveyor</th>
              {#each weeks as weekDate (format(weekDate, 'yyyy-MM-dd'))}
                <th class="header-cell week-col">{formatWeekHeader(weekDate)}</th>
              {/each}
              <!-- Add More Header Cell -->
              <th class="header-cell add-week-col">
                  <button on:click={extendTimeline} title="Add one month">+</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each $instructedSurveyors as surveyor (surveyor.id)}
              {@const review = getReviewForQuote(surveyor.id)} 
              <tr>
                <td class="sticky-col surveyor-name-cell">{surveyor.organisation} <span class="discipline">({surveyor.discipline})</span></td>
                {#each weeks as weekDate (format(weekDate, 'yyyy-MM-dd'))}
                  <td class="week-cell">
                    {#if review}
                        {#if isDateInWeek(review.siteVisitDate, weekDate)}
                            <div class="timeline-event site-visit">Site Visit</div>
                        {/if}
                        {#if isDateInWeek(review.reportDraftDate, weekDate)}
                            <div class="timeline-event draft-due">Draft due</div>
                        {/if}
                    {/if}
                    <!-- Other events could be added here -->
                  </td>
                {/each}
                 <!-- Empty cell for the add column -->
                 <td class="week-cell"></td> 
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
         <p>No instructed surveyors found for this project to display in the timeline.</p>
      {/if}
       
       <!-- Removed original event list placeholder -->

    </div>
  {:else}
    <p>Please select a project to view the programme.</p>
  {/if}

  <!-- Key Date Modal rendering removed -->
  <!-- 
  {#if showKeyDateModal && selectedDateStr}
    <KeyDateModal 
      selectedDate={selectedDateStr} 
      on:save={handleModalSave} 
      on:cancel={handleModalCancel} 
    />
  {/if}
  -->
</div>

<style>
  /* CSS Imports moved to app.html or +layout.svelte */

  /* Styles adjusted for better height without calendar */
   .programme-container {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    flex-grow: 1; 
    height: calc(100vh - 150px); /* Adjust as needed */
    overflow: hidden; 
  }
  
  h1, .programme-header {
    padding: 0 1rem; /* Add padding to match content */
    margin-bottom: 1rem;
    flex-shrink: 0; 
  }
  
  h2 {
    font-size: 1.5rem;
    color: #555;
    margin: 0;
  }
  
  .programme-content {
    flex-grow: 1; 
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: auto; /* Allow scrolling for the table */
    min-height: 0; 
    padding: 0; /* Remove padding here, add to inner elements if needed */
  }

  .timeline-view {
     padding: 1rem; /* Add padding back */
  }

  .timeline-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed; /* Helps with column widths */
    margin-bottom: 1rem;
  }

  .timeline-table th, .timeline-table td {
    border: 1px solid #dee2e6;
    padding: 0.5rem;
    text-align: left;
    font-size: 0.9rem;
    white-space: nowrap; /* Prevent wrapping initially */
  }
  
  .timeline-table thead th {
    background-color: #f8f9fa;
    position: sticky; /* Sticky header */
    top: 0;
    z-index: 2; /* Ensure header is above body cells */
  }

  .sticky-col {
    position: sticky;
    left: 0;
    background-color: #f8f9fa; /* Match header bg */
    z-index: 1; /* Below header corner */
    width: 200px; /* Fixed width for surveyor column */
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  thead .sticky-col {
     z-index: 3; /* Ensure top-left corner is on top */
  }

  .header-cell {
     text-align: center;
     vertical-align: middle; /* Align button vertically */
  }

  .week-col {
     width: 100px; /* Fixed width for week columns */
  }
  
  .add-week-col {
     width: 50px; /* Smaller width for the add button */
     padding: 0; /* Remove padding for button cell */
  }

  .add-week-col button {
      width: 100%;
      height: 100%;
      border: none;
      background: #e9ecef; /* Slightly different background */
      cursor: pointer;
      font-size: 1.2rem;
      font-weight: bold;
      color: #495057;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 0; /* Match padding of other header cells */
  }
  .add-week-col button:hover {
      background: #ced4da;
  }
  
  .surveyor-name-cell {
      font-weight: bold;
      white-space: normal; /* Allow surveyor name to wrap */
  }
  .discipline {
      font-size: 0.8em;
      color: #6c757d;
      display: block; /* Put discipline on new line */
  }

  .week-cell {
    min-height: 30px; 
    border-right: 1px solid #dee2e6; 
    vertical-align: top; /* Align content to top */
    padding: 0.3rem; /* Adjust padding slightly */
  }

  .timeline-event {
      font-size: 0.8em;
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
      margin-bottom: 0.2rem;
      white-space: normal; /* Allow text wrap */
      line-height: 1.2;
  }
  
  .site-visit {
      background-color: #cfe2ff; /* Light blue */
      border: 1px solid #9ec5fe;
      color: #052c65;
  }

  .draft-due {
      background-color: #f8d7da; /* Light red */
      border: 1px solid #f1aeb5;
      color: #58151a;
  }

  /* Add specific style for the last cell in body rows */
  tbody tr td:last-child {
      /* Match background or keep it plain? */
      /* background-color: #f8f9fa; */ 
      border-right: 1px solid #dee2e6; 
  }

  /* Placeholder text style remains */
  .placeholder-text {
    color: #6c757d;
    font-style: italic;
    margin-bottom: 1rem; 
  }
</style> 