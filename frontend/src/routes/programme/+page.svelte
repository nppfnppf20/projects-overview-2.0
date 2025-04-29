<script lang="ts">
  import {
    selectedProject, 
    allProgrammeEvents, 
    addProgrammeEvent,
    type ProgrammeEvent
  } from "$lib/stores/projectStore";
  import { onMount } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction'; // For date clicking, event dragging etc.
  import KeyDateModal from '$lib/components/KeyDateModal.svelte'; // Import the modal
  import { derived } from 'svelte/store';
  
  // CSS imports removed from here

  let calendarEl: HTMLElement;
  let calendar: Calendar;

  // Modal State
  let showKeyDateModal = false;
  let selectedDateStr: string | null = null;

  // Filter programme events for the current project
  const currentProjectEvents = derived(
    [allProgrammeEvents, selectedProject],
    ([$allProgrammeEvents, $selectedProject]) => {
      if (!$selectedProject) return [];
      return $allProgrammeEvents
        .filter(event => event.projectId === $selectedProject.id)
        .map(event => ({ // Map to FullCalendar format
            id: event.id,
            title: event.title,
            date: event.date,
            color: event.color, // Use color directly
            // backgroundColor: event.color, // Alternatively use these
            // borderColor: event.color
        }));
    }
  );

  onMount(() => {
    calendar = new Calendar(calendarEl, {
      plugins: [ dayGridPlugin, interactionPlugin ],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay' // Optional: Add week/day views
      },
      events: $currentProjectEvents, // Initial events from store
      selectable: true, // Allow date selection
      select: handleDateSelect, // Callback for date selection
      eventClick: handleEventClick, // Optional: handle clicking existing events
      height: '100%', // Use 100% height to fill container
      // aspectRatio: 1.8 
    });

    calendar.render();

    // Subscribe to store changes to update calendar events
    const unsubscribe = currentProjectEvents.subscribe(events => {
      if (calendar) {
        calendar.setOption('events', events);
      }
    });

    // Cleanup on component destroy
    return () => {
      calendar.destroy();
      unsubscribe(); // Unsubscribe from store
    };
  });

  function handleDateSelect(selectInfo: { startStr: string, endStr: string, allDay: boolean }) {
      // Adjust end date if it spans multiple days (FullCalendar's end date is exclusive)
      const endDate = new Date(selectInfo.endStr);
      endDate.setDate(endDate.getDate() - 1);
      const adjustedEndStr = endDate.toISOString().split('T')[0];

      // Only handle single day clicks/selections for this feature
      if (selectInfo.startStr === adjustedEndStr) {
          selectedDateStr = selectInfo.startStr;
          showKeyDateModal = true;
      } else {
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
      calendar.unselect(); // Clear selection visuals
  }

  function handleModalCancel() {
      showKeyDateModal = false;
      selectedDateStr = null;
      calendar.unselect(); // Clear selection visuals
  }

</script>

<div class="programme-container">
  <h1>Programme</h1>
  
  {#if $selectedProject}
    <div class="programme-header">
      <h2>Programme for {$selectedProject.name}</h2>
      <!-- Add relevant buttons here later, e.g., "Add Event" -->
    </div>
    
    <div class="programme-content">
       <div bind:this={calendarEl} class="calendar-wrapper"></div>
    </div>
  {:else}
    <p>Please select a project to view the programme.</p>
  {/if}

  <!-- Render Key Date Modal -->
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
</style> 