<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { format, parseISO } from 'date-fns';

  export let showModal: boolean = false; // Controlled externally
  export let initialDate: Date; // The start date of the week clicked

  let title: string = '';
  // Format initialDate to YYYY-MM-DD for the date input
  let dateStr: string = format(initialDate, 'yyyy-MM-dd'); 
  
  // Define color options
  const colorOptions = [
    '#0d6efd', // Bootstrap Primary Blue
    '#198754', // Bootstrap Success Green
    '#ffc107', // Bootstrap Warning Yellow
    '#dc3545', // Bootstrap Danger Red
    '#6c757d'  // Bootstrap Secondary Gray
  ];
  let color: string = colorOptions[0]; // Default to the first option

  const dispatch = createEventDispatcher<{ save: { title: string; date: string; color: string }; cancel: void }>();

  let dialog: HTMLDialogElement;

  // Use dialog element for better accessibility and management
  $: if (dialog && showModal) dialog.showModal();
  $: if (dialog && !showModal) dialog.close();

  function handleSave() {
    if (!title || !dateStr || !color) {
      alert('Please fill in all fields.');
      return;
    }
    dispatch('save', { title, date: dateStr, color });
    resetForm();
  }

  function handleCancel() {
    dispatch('cancel');
    resetForm();
    // Note: dialog.close() is handled by the reactive statement
  }

  function resetForm() {
    title = '';
    dateStr = format(initialDate, 'yyyy-MM-dd'); // Reset date to initial
    color = colorOptions[0]; // Reset to default color
  }
  
  // Handle closing via Escape key or clicking backdrop (default dialog behavior)
  function handleDialogClose() {
      if (showModal) { // Only dispatch cancel if modal was meant to be open
          dispatch('cancel');
          resetForm();
      }
  }

  // Ensure dateStr is updated if initialDate prop changes while modal is hidden
  $: if (!showModal) {
      dateStr = format(initialDate, 'yyyy-MM-dd');
      color = colorOptions[0]; // Reset color when modal is hidden too
  }

</script>

<dialog bind:this={dialog} on:close={handleDialogClose} class="key-date-modal">
  <form method="dialog" on:submit|preventDefault={handleSave}>
    <h2>Add New Key Date</h2>
    
    <div class="form-group">
      <label for="key-date-title">Title:</label>
      <input type="text" id="key-date-title" bind:value={title} required />
    </div>

    <div class="form-group">
      <label for="key-date-date">Date:</label>
      <!-- Date input defaults to the start of the clicked week -->
      <input type="date" id="key-date-date" bind:value={dateStr} required />
    </div>

    <div class="form-group">
      <label>Color:</label>
      <div class="color-options-container">
          {#each colorOptions as option (option)}
              <button 
                  type="button"
                  class="color-swatch"
                  class:selected={color === option} 
                  style="background-color: {option};"
                  on:click={() => color = option}
                  aria-label="Select color {option}"
                  title="Select color {option}"
              >
                 <!-- Optional: Checkmark for selected -->
                 {#if color === option}✓{/if}
              </button>
          {/each}
      </div>
      <!-- Removed input type=color and preview span -->
    </div>

    <div class="modal-actions">
      <button type="button" on:click={handleCancel}>Cancel</button>
      <button type="submit" class="primary">Save Key Date</button>
    </div>
  </form>
</dialog>

<style>
  .key-date-modal {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 1.5rem 2rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    min-width: 350px;
    max-width: 90vw; /* Ensure it doesn't get too wide */
  }
  
  /* Style backdrop */
  .key-date-modal::backdrop {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
  }

  h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
    color: #333;
    text-align: center;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: bold;
    font-size: 0.9rem;
    color: #555;
  }

  .form-group input[type="text"],
  .form-group input[type="date"] {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box; 
    font-size: 1rem;
  }
  
  .color-options-container {
      display: flex;
      gap: 0.5rem; /* Space between swatches */
      align-items: center;
  }

  .color-swatch {
      width: 30px;
      height: 30px;
      border-radius: 50%; /* Make them circular */
      border: 2px solid #fff; /* White border */
      cursor: pointer;
      box-shadow: 0 0 0 1px #ccc; /* Subtle outer border */
      transition: transform 0.1s ease, box-shadow 0.1s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      color: white; /* Color for checkmark */
      text-shadow: 1px 1px 1px rgba(0,0,0,0.5); /* Shadow for checkmark */
  }
  
  .color-swatch:hover {
      transform: scale(1.1);
  }

  .color-swatch.selected {
      box-shadow: 0 0 0 2px #0d6efd; /* Blue border for selected */
      transform: scale(1.1);
  }

  .modal-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .modal-actions button {
    padding: 0.6rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    background-color: #f8f9fa;
    transition: background-color 0.2s ease;
  }
  .modal-actions button:hover {
    background-color: #e2e6ea;
  }

  .modal-actions button.primary {
    background-color: #0d6efd;
    color: white;
    border-color: #0d6efd;
  }
  .modal-actions button.primary:hover {
    background-color: #0b5ed7;
  }
</style> 