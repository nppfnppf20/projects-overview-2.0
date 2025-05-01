<script lang="ts">
  import {
    selectedProject, 
    allProgrammeEvents, 
    addProgrammeEvent,
    allQuotes, // Import quotes store
    allReviews, // Import reviews store
    type ProgrammeEvent,
    type Quote, // Import Quote type
    type SurveyorReview // Import SurveyorReview type
  } from "$lib/stores/projectStore";
  import { onMount } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction'; // For date clicking, event dragging etc.
  import KeyDateModal from '$lib/components/KeyDateModal.svelte'; // Import the modal
  import { derived } from 'svelte/store';
  import { getWeek, startOfWeek, endOfWeek, eachWeekOfInterval, format, parseISO, isWithinInterval, addWeeks, subWeeks } from 'date-fns'; // Date utility functions
  
  // CSS imports removed from here

  // NEW: State for active tab
  let activeTab: 'timeline' | 'calendar' = 'timeline'; // Default to timeline

  let calendarEl: HTMLElement | null = null; // Can be null initially
  let calendar: Calendar | null = null; // Can be null initially

  // Modal State
  let showKeyDateModal = false;
  let selectedDateStr: string | null = null;

  // MODIFIED: Calendar Events - Include programme events AND surveyor dates
  const currentProjectEvents = derived(
    [allProgrammeEvents, allQuotes, allReviews, selectedProject],
    ([$allEvents, $allQuotes, $allReviews, $project]) => {
      if (!$project) return [];

      // 1. Get standard programme events
      const programmeEvents = $allEvents
        .filter(event => event.projectId === $project.id)
        .map(event => ({ 
            id: event.id, 
            title: event.title, 
            date: event.date, 
            color: event.color 
        }));

      // 2. Get instructed and partially instructed quotes
      const relevantQuotes = $allQuotes.filter(q => 
          q.projectId === $project.id && 
          (q.instructionStatus === 'instructed' || q.instructionStatus === 'partially instructed')
      );

      // 3. Generate events from surveyor review dates
      const surveyorDateEvents = relevantQuotes.flatMap(quote => {
          const review = $allReviews.find(r => r.quoteId === quote.id);
          const events = [];
          if (review?.siteVisitDate) {
              events.push({
                  id: `sv-${quote.id}`,
                  title: `Site Visit: ${quote.organisation}`,
                  date: review.siteVisitDate,
                  color: '#007bff' // Blue for Site Visit
              });
          }
          if (review?.reportDraftDate) {
               events.push({
                  id: `rd-${quote.id}`,
                  title: `Report Draft: ${quote.organisation}`,
                  date: review.reportDraftDate,
                  color: '#28a745' // Green for Report Draft
              });
          }
          return events;
      });

      // 4. Combine both event types
      return [...programmeEvents, ...surveyorDateEvents];
    }
  );

  // NEW: Filtered Key Dates for Timeline
  const timelineKeyDates = derived(
      [allProgrammeEvents, selectedProject],
      ([$allEvents, $project]) => {
          if (!$project) return [];
          return $allEvents
              .filter(event => event.projectId === $project.id)
              .map(event => ({
                  ...event,
                  parsedDate: parseISO(event.date) // Ensure date is parsed
              }));
      }
  );

  // NEW: Timeline Data - Instructed Surveyors with Dates
  const instructedSurveyorTimelineData = derived(
      [allQuotes, allReviews, selectedProject],
      ([$allQuotes, $allReviews, $project]) => {
          if (!$project) return [];
          
          // MODIFIED: Filter to include both instructed and partially instructed
          const relevantQuotes = $allQuotes.filter(q => 
              q.projectId === $project.id && 
              (q.instructionStatus === 'instructed' || q.instructionStatus === 'partially instructed')
          );
          
          return relevantQuotes.map(quote => {
              const review = $allReviews.find(r => r.quoteId === quote.id);
              return {
                  id: quote.id,
                  organisation: quote.organisation,
                  siteVisitDate: review?.siteVisitDate ? parseISO(review.siteVisitDate) : undefined,
                  reportDraftDate: review?.reportDraftDate ? parseISO(review.reportDraftDate) : undefined
              };
          });
      }
  );

  // NEW: Calculate Date Range and Weeks for Timeline Header
  const timelineRange = derived(instructedSurveyorTimelineData, ($data) => {
      if (!$data || $data.length === 0) {
          // Default range if no data: Current week +/- 4 weeks
          const today = new Date();
          return {
              start: startOfWeek(subWeeks(today, 4), { weekStartsOn: 1 }), // Monday
              end: endOfWeek(addWeeks(today, 4), { weekStartsOn: 1 })
          };
      }

      let earliestDate: Date | null = null;
      let latestDate: Date | null = null;

      $data.forEach(item => {
          const dates = [item.siteVisitDate, item.reportDraftDate].filter(d => d instanceof Date) as Date[];
          dates.forEach(date => {
              if (!earliestDate || date < earliestDate) earliestDate = date;
              if (!latestDate || date > latestDate) latestDate = date;
          });
      });

      // Fallback if no dates found in data
      if (!earliestDate || !latestDate) {
           const today = new Date();
           earliestDate = subWeeks(today, 4);
           latestDate = addWeeks(today, 4);
      }

      // Add padding (e.g., 2 weeks before, 4 weeks after)
      const paddedStart = startOfWeek(subWeeks(earliestDate, 2), { weekStartsOn: 1 });
      const paddedEnd = endOfWeek(addWeeks(latestDate, 4), { weekStartsOn: 1 });

      return { start: paddedStart, end: paddedEnd };
  });

  const timelineWeeks = derived(timelineRange, ($range) => {
      if (!$range.start || !$range.end) return [];
      // Generate array of week start dates (Mondays)
      return eachWeekOfInterval($range, { weekStartsOn: 1 });
  });

  // MODIFIED: Calendar initialization logic, only runs when calendar view is active
  function initializeCalendar() {
      if (calendarEl && !calendar) { // Only initialize if element exists and calendar not already created
          calendar = new Calendar(calendarEl, {
              plugins: [ dayGridPlugin, interactionPlugin ],
              initialView: 'dayGridMonth',
              headerToolbar: {
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek,dayGridDay'
              },
              events: $currentProjectEvents, 
              selectable: true, 
              select: handleDateSelect, 
              eventClick: handleEventClick, 
              height: '100%', 
          });
          calendar.render();
      } else if (calendar) {
          // If calendar exists, ensure events are up-to-date (e.g., switching projects)
          calendar.setOption('events', $currentProjectEvents);
      }
  }

  function destroyCalendar() {
      if (calendar) {
          calendar.destroy();
          calendar = null;
      }
  }

  // Use onMount to initialize calendar IF the calendar tab is initially active
  onMount(() => {
    if (activeTab === 'calendar') {
        initializeCalendar();
    }
    
    // Subscribe to store changes to update calendar events WHEN calendar exists
    const unsubscribeEvents = currentProjectEvents.subscribe(events => {
      if (calendar) { // Check if calendar object exists
        calendar.setOption('events', events);
      }
    });
    
    // Subscribe to selected project to re-initialize/update calendar
    const unsubscribeProject = selectedProject.subscribe($project => {
        if ($project && calendar && activeTab === 'calendar') {
            // If project changes while calendar is active, update events
            calendar.setOption('events', $currentProjectEvents);
        } else if ($project && !calendar && activeTab === 'calendar') {
            // If project selected and calendar tab is active but calendar not init, init now
            initializeCalendar();
        } else if (!$project && calendar) {
             // If project deselected, clear events? Or destroy? Let's clear.
             if (calendar) calendar.setOption('events', []);
        }
    });


    // Cleanup on component destroy
    return () => {
      destroyCalendar();
      unsubscribeEvents(); 
      unsubscribeProject();
    };
  });

  // MODIFIED: Use reactive statement to initialize/destroy calendar when tab changes
   $: {
        if (activeTab === 'calendar' && $selectedProject) {
            // Timeout ensures the element is in the DOM after the #if block renders
            setTimeout(initializeCalendar, 0); 
        } else {
            destroyCalendar();
        }
   }

  function handleDateSelect(selectInfo: { startStr: string, endStr: string, allDay: boolean }) {
      // Adjust end date if it spans multiple days (FullCalendar's end date is exclusive)
      const endDate = new Date(selectInfo.endStr);
      endDate.setDate(endDate.getDate() - 1);
      const adjustedEndStr = endDate.toISOString().split('T')[0];

      // Only handle single day clicks/selections for this feature
      if (selectInfo.startStr === adjustedEndStr) {
          selectedDateStr = selectInfo.startStr;
          showKeyDateModal = true;
      } else if (calendar) {
          // If selection is multiple days, clear selection
          calendar.unselect();
      }
  }

  // Optional: Handle clicking on an existing event (e.g., for editing/deleting)
  function handleEventClick(clickInfo: { event: any }) {
    console.log('Event clicked:', clickInfo.event.id, clickInfo.event.title);
    // Could open a modal here to edit/delete, passing clickInfo.event.id
    // Example: Open an edit modal or confirmation dialog
    // if (confirm(`Delete event '${clickInfo.event.title}'?`)) {
    //   deleteProgrammeEvent(clickInfo.event.id);
    // }
  }
  
  function handleModalSave(event: CustomEvent<{ title: string; date: string; color: string }>) {
      if (!$selectedProject) return;
      const newEventData = event.detail;
      
      addProgrammeEvent({
          projectId: $selectedProject.id,
          title: newEventData.title,
          date: newEventData.date,
          color: newEventData.color
      });
      
      showKeyDateModal = false; // Close modal
      selectedDateStr = null;
      if (calendar) calendar.unselect(); // Clear selection visuals
  }

  function handleModalCancel() {
      showKeyDateModal = false;
      selectedDateStr = null;
      if (calendar) calendar.unselect(); // Clear selection visuals
  }

  // NEW: Helper function for Timeline View
  function isDateInWeek(date: Date | undefined, weekStartDate: Date): boolean {
      if (!date) return false;
      const weekInterval = {
          start: weekStartDate,
          end: endOfWeek(weekStartDate, { weekStartsOn: 1 })
      };
      return isWithinInterval(date, weekInterval);
  }

</script>

<div class="programme-container">
  <h1>Programme</h1>
  
  {#if $selectedProject}
    <div class="programme-header">
      <h2>Programme for {$selectedProject.name}</h2>
      <!-- Optional: Add actions relevant to the whole programme page -->
    </div>

    <!-- NEW: Tabs Navigation -->
    <div class="tabs-nav">
        <button 
            class:active={activeTab === 'timeline'}
            on:click={() => activeTab = 'timeline'}
        >
            Timeline view
        </button>
        <button 
            class:active={activeTab === 'calendar'}
            on:click={() => activeTab = 'calendar'}
        >
            Calendar view
        </button>
    </div>
    
    <!-- NEW: Tab Content Area -->
    <div class="tab-content-area">
        {#if activeTab === 'timeline'}
            <div class="tab-pane timeline-pane">
                {#if $instructedSurveyorTimelineData && $instructedSurveyorTimelineData.length > 0}
                    <div class="timeline-wrapper">
                        <table class="timeline-table">
                            <thead>
                                <tr>
                                    <th class="th-sticky">Surveyor</th>
                                    {#each $timelineWeeks as weekStartDate (weekStartDate.toISOString())}
                                        <th>
                                            <!-- Week {getWeek(weekStartDate, { weekStartsOn: 1, firstWeekContainsDate: 4 })}<br/> -->
                                            <span class="week-date">w/c {format(weekStartDate, 'dd MMM')}</span>
                                        </th>
                                    {/each}
                                </tr>
                            </thead>
                            <tbody>
                                <!-- NEW: Key Dates Row -->
                                <tr>
                                    <td class="td-sticky key-dates-header">Key Dates</td>
                                    {#each $timelineWeeks as weekStartDate (weekStartDate.toISOString())}
                                        <td>
                                            <div class="timeline-markers">
                                                 {#each $timelineKeyDates as keyEvent (keyEvent.id)}
                                                    {#if isDateInWeek(keyEvent.parsedDate, weekStartDate)}
                                                         <div 
                                                            class="marker key-date" 
                                                            style="background-color: {keyEvent.color || '#6c757d'};" 
                                                            title="{keyEvent.title}: {format(keyEvent.parsedDate, 'dd MMM yyyy')}"
                                                        >
                                                            {keyEvent.title.substring(0, 2).toUpperCase()} 
                                                        </div>
                                                    {/if}
                                                 {/each}
                                            </div>
                                        </td>
                                    {/each}
                                </tr>
                                <!-- Existing Surveyor Rows -->
                                {#each $instructedSurveyorTimelineData as surveyor (surveyor.id)}
                                    <tr>
                                        <td class="td-sticky">{surveyor.organisation}</td>
                                        {#each $timelineWeeks as weekStartDate (weekStartDate.toISOString())}
                                            <td>
                                                <div class="timeline-markers">
                                                    {#if isDateInWeek(surveyor.siteVisitDate, weekStartDate)}
                                                        <div class="marker site-visit" title="Site Visit: {format(surveyor.siteVisitDate!, 'dd MMM yyyy')}">SV</div>
                                                    {/if}
                                                    {#if isDateInWeek(surveyor.reportDraftDate, weekStartDate)}
                                                        <div class="marker report-draft" title="Report Draft: {format(surveyor.reportDraftDate!, 'dd MMM yyyy')}">RD</div>
                                                    {/if}
                                                </div>
                                            </td>
                                        {/each}
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {:else}
                     <p class="placeholder-text">No instructed surveyors with dates found for this project.</p>
                {/if}
            </div>
        {:else if activeTab === 'calendar'}
             <!-- MOVED: Calendar wrapper into this tab -->
            <div class="tab-pane calendar-pane">
                 <div bind:this={calendarEl} class="calendar-wrapper">
                     <!-- Calendar will be rendered here by FullCalendar -->
                 </div>
            </div>
        {/if}
    </div>

  {:else}
    <p>Please select a project to view the programme.</p>
  {/if}

  <!-- MOVED: Modal outside conditional project block, but still conditional on its own state -->
  {#if showKeyDateModal && selectedDateStr}
    <KeyDateModal 
      selectedDate={selectedDateStr} 
      on:save={handleModalSave} 
      on:cancel={handleModalCancel} 
    />
  {/if}
</div>

<style>
  /* CSS Imports moved to app.html or +layout.svelte */

  /* Styles adjusted for better calendar height */
   .programme-container {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    flex-grow: 1; 
    /* Calculate height minus header/footer - Adjust 150px as needed */
    height: calc(100vh - 150px); 
    overflow: hidden; /* Prevent container scroll */
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #333;
    flex-shrink: 0; /* Prevent shrinking */
  }
  
  .programme-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem; /* Reduced margin */
    flex-shrink: 0; 
  }
  
  h2 {
    font-size: 1.5rem;
    color: #555;
    margin: 0;
  }
  
  .programme-content {
    flex-grow: 1; /* Take remaining space */
    display: flex; 
    flex-direction: column;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 1rem; 
    overflow: hidden; /* Hide overflow */
    min-height: 0; /* Allow shrinking */
  }

  .calendar-wrapper {
      flex-grow: 1; 
      height: 100%; /* Fill parent */
      position: relative; /* Needed for absolute positioning of calendar parts */
  }
  
  /* Force FullCalendar to take full height of its wrapper */
  :global(.fc) {
      height: 100% !important; 
      width: 100%;
  }

  :global(.fc .fc-view-harness) {
      height: 100% !important; /* Ensure view harness takes full height */
  }

  :global(.fc .fc-toolbar-title) {
      font-size: 1.5em;
  }

  :global(.fc .fc-button) {
      font-size: 0.9em;
  }
  
  .placeholder-text {
    color: #6c757d;
    font-style: italic;
  }

  /* NEW: Tab Navigation Styles */
  .tabs-nav {
      display: flex;
      border-bottom: 2px solid #dee2e6;
      margin-bottom: 1rem;
      flex-shrink: 0;
  }

  .tabs-nav button {
      background: none;
      border: none;
      padding: 0.75rem 1.25rem;
      cursor: pointer;
      font-size: 1rem;
      color: #6c757d;
      margin-bottom: -2px; /* Overlap border */
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s;
  }

  .tabs-nav button:hover {
      color: #0056b3;
  }

  .tabs-nav button.active {
      color: #495057;
      border-bottom-color: #007bff;
      font-weight: 600;
  }
  
  /* NEW: Tab Content Area */
  .tab-content-area {
      flex-grow: 1; /* Take remaining space */
      display: flex; /* Use flex to manage child pane height */
      flex-direction: column;
      min-height: 0; /* Crucial for flex children height */
      overflow: hidden; /* Prevent scrollbars here */
  }

  .tab-pane {
      flex-grow: 1; /* Allow pane to fill the content area */
      display: flex; /* Use flex for content within the pane */
      flex-direction: column;
      overflow: hidden; /* Hide overflow */
      /* Add padding if needed, or apply to specific content */
      /* padding: 1rem; */ 
  }

  /* Specific styling for the calendar pane if needed */
  .calendar-pane {
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 1rem;
  }

  /* Styles adjusted for tabs and ensuring calendar fits */
   .programme-container {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    flex-grow: 1; 
    height: calc(100vh - 150px); /* Adjust if header/footer height changes */
    overflow: hidden; 
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #333;
    flex-shrink: 0; 
  }
  
  .programme-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem; /* Reduced margin */
    flex-shrink: 0; 
  }
  
  h2 {
    font-size: 1.5rem;
    color: #555;
    margin: 0;
  }

  /* Styles adjusted for better calendar height */
   .programme-container {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    flex-grow: 1; 
    /* Calculate height minus header/footer - Adjust 150px as needed */
    height: calc(100vh - 150px); 
    overflow: hidden; /* Prevent container scroll */
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #333;
    flex-shrink: 0; /* Prevent shrinking */
  }
  
  .programme-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-shrink: 0; 
  }
  
  h2 {
    font-size: 1.5rem;
    color: #555;
    margin: 0;
  }
  
  .programme-content {
    flex-grow: 1; /* Take remaining space */
    display: flex; 
    flex-direction: column;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 1rem; 
    overflow: hidden; /* Hide overflow */
    min-height: 0; /* Allow shrinking */
  }

  .calendar-wrapper {
      flex-grow: 1; 
      height: 100%; /* Fill parent */
      position: relative; /* Needed for absolute positioning of calendar parts */
  }
  
  /* Force FullCalendar to take full height of its wrapper */
  :global(.fc) {
      height: 100% !important; 
      width: 100%;
  }

  :global(.fc .fc-view-harness) {
      height: 100% !important; /* Ensure view harness takes full height */
  }

  :global(.fc .fc-toolbar-title) {
      font-size: 1.5em;
  }

  :global(.fc .fc-button) {
      font-size: 0.9em;
  }
  
  .placeholder-text {
    color: #6c757d;
    font-style: italic;
  }

  /* --- Timeline View Styles --- */
  .timeline-pane {
      overflow: hidden; /* Prevent overflow on the pane itself */
      display: flex; /* Use flex for the wrapper */
      flex-direction: column;
  }

  .timeline-wrapper {
      flex-grow: 1; /* Allow wrapper to grow */
      overflow: auto; /* Enable scrolling for the table */
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .timeline-table {
      border-collapse: collapse;
      width: 100%;
      table-layout: fixed; /* Prevent content from stretching columns */
      min-width: 1000px; /* Ensure horizontal scroll appears if needed */
      border: 1px solid #e0e0e0;
  }

  .timeline-table th, 
  .timeline-table td {
      border: 1px solid #e0e0e0;
      padding: 0.5rem;
      text-align: center;
      min-width: 80px; /* Min width for week columns */
      height: 50px; /* Fixed height for rows */
      vertical-align: middle;
  }

  .timeline-table thead th {
      background-color: #f8f9fa;
      font-weight: 600;
      font-size: 0.85rem;
      color: #495057;
      position: sticky; /* Sticky header */
      top: 0;
      z-index: 2;
  }

  .week-date {
      font-size: 0.75rem;
      font-weight: normal;
      color: #6c757d;
  }

  /* Sticky first column (Surveyor Name) */
  .th-sticky, .td-sticky {
      position: sticky;
      left: 0;
      background-color: #f8f9fa; /* Match header bg or use #fff for body */
      z-index: 1;
      text-align: left;
      min-width: 150px;
      width: 150px; /* Fixed width */
      font-weight: 500;
  }
  
  .td-sticky {
      background-color: #fff; /* White background for body sticky cell */
       font-weight: normal;
  }

  /* Ensure header sticky is above body sticky */
  .th-sticky {
       z-index: 3;
  }

  .timeline-markers {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.3rem;
      height: 100%;
  }

  .marker {
      display: inline-flex; /* Use inline-flex for alignment */
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
      cursor: default; /* Indicate it's not clickable (yet) */
  }

  /* NEW: Style for Key Date markers (uses inline style for background) */
  .marker.key-date {
      /* Default background if color not provided */
      background-color: #6c757d; 
  }
  
  /* NEW: Style for the sticky header cell of the Key Dates row */
  .td-sticky.key-dates-header {
       font-weight: 600; /* Make it bold like other headers */
       background-color: #f8f9fa; /* Match header background */
  }

  .site-visit {
      background-color: #007bff; /* Blue */
  }

  .report-draft {
      background-color: #28a745; /* Green */
  }

</style> 