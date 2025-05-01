<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { LineItem } from '$lib/stores/projectStore';

  export let lineItems: LineItem[] = [];
  export let organisationName: string = ''; // For context in the modal title

  const dispatch = createEventDispatcher();

  // NEW: State to track selected line item indices
  let selectedItemIndices: Set<number> = new Set();

  // Initialize selection state when component mounts or lineItems change
  onMount(() => {
      selectedItemIndices = new Set(); // Clear selection on mount/remount
  });
  // Reactive statement to clear selection if lineItems prop changes
  $: if (lineItems) {
      selectedItemIndices = new Set();
  }

  // NEW: Toggle selection for a specific index
  function toggleSelection(index: number) {
      if (selectedItemIndices.has(index)) {
          selectedItemIndices.delete(index);
      } else {
          selectedItemIndices.add(index);
      }
      // Force reactivity for the set
      selectedItemIndices = selectedItemIndices;
  }

  function handleConfirm() {
    // Dispatch the set of selected indices along with the confirm event
    // The parent component doesn't use this yet, but it's available for future use
    dispatch('confirm', { selectedIndices: selectedItemIndices }); 
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="modal-overlay" on:click|self={handleCancel}> 
  <div class="modal-content partial-instruction-modal">
    <div class="modal-header">
      <h2>Partially Instruct Items for {organisationName}</h2>
      <button class="close-btn" on:click={handleCancel}>×</button>
    </div>
    <div class="modal-body">
      <p>Please review the line items below. Confirming will set the quote status to "Partially Instructed".</p>
      
      {#if lineItems.length > 0}
        <ul class="line-items-list-display">
          {#each lineItems as item, index}
            <li class="line-item-display" on:click={() => toggleSelection(index)} title="Click to toggle selection"> 
              <input 
                  type="checkbox" 
                  id={`item-${index}`} 
                  checked={selectedItemIndices.has(index)}
                  class="line-item-checkbox"
                  on:change|stopPropagation={() => toggleSelection(index)}
                  on:click|stopPropagation
              />
              <label for={`item-${index}`} class="item-label">
                 <span class="item-desc">{item.description}</span>
                 <span class="item-cost">£{item.cost.toFixed(2)}</span>
              </label>
            </li>
          {/each}
        </ul>
      {:else}
        <p>No line items found for this quote.</p>
      {/if}
      
      <!-- Add notes or further instructions here if needed -->

    </div>
    <div class="modal-footer">
      <button class="cancel-btn" on:click={handleCancel}>Cancel</button>
      <button class="submit-btn confirm-btn" on:click={handleConfirm}>Confirm Partial Instruction</button>
    </div>
  </div>
</div>

<style>
  /* Use existing modal styles where possible, add specific overrides */
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex; justify-content: center; align-items: center;
    z-index: 1010; /* Ensure it's above other modals if necessary */
  }
  
  .modal-content {
    background-color: white; border-radius: 5px;
    width: 90%; max-width: 600px; /* Slightly wider maybe */
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
  }
  
  .modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1rem 1.5rem; border-bottom: 1px solid #e9ecef;
    flex-shrink: 0;
  }
  
  .modal-header h2 { font-size: 1.4rem; margin: 0; }
  
  .close-btn {
    background: none; border: none; font-size: 1.5rem;
    cursor: pointer; color: #6c757d;
  }
  
  .modal-body {
    padding: 1.5rem;
    flex-grow: 1;
    overflow-y: auto; /* Allow body scroll if needed */
  }

  .modal-body p {
      margin-bottom: 1rem;
      color: #333;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem; border-top: 1px solid #e9ecef;
    display: flex; justify-content: flex-end; gap: 1rem;
    flex-shrink: 0;
  }

  .line-items-list-display {
      list-style: none;
      padding: 0;
      margin: 1rem 0;
      border: 1px solid #eee;
      border-radius: 4px;
      max-height: 300px; /* Limit height if many items */
      overflow-y: auto;
  }

  .line-item-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #eee;
      cursor: pointer; /* Make the whole row clickable */
      transition: background-color 0.15s ease-in-out;
  }
   .line-item-display:hover {
       background-color: #f8f9fa; /* Subtle hover */
   }

   .line-item-display:last-child {
       border-bottom: none;
   }

   /* NEW: Checkbox style */
   .line-item-checkbox {
       margin-right: 0.75rem;
       cursor: pointer;
       flex-shrink: 0; /* Prevent checkbox shrinking */
       /* Optional: Increase size */
       /* width: 1.2em;
       height: 1.2em; */
   }

   /* NEW: Label to contain desc and cost for better click handling */
   .item-label {
       display: flex;
       justify-content: space-between;
       flex-grow: 1;
       align-items: center; /* Align items vertically */
       cursor: pointer; /* Match li cursor */
   }

  .item-desc {
      flex-grow: 1;
      margin-right: 1rem;
      /* Removed margin-left comment */
  }

  .item-cost {
      font-weight: 500;
      color: #495057;
      white-space: nowrap;
  }
  
  /* Standard Cancel/Submit Buttons */
   .cancel-btn {
    padding: 0.6rem 1.5rem;
    border: 1px solid #ced4da;
    background-color: white;
    border-radius: 4px;
    color: #495057;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .submit-btn { /* General submit style */
    padding: 0.6rem 1.5rem;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
  }
  
  .cancel-btn:hover { background-color: #f8f9fa; }
  
  /* Specific style for the confirm button */
  .confirm-btn {
      background-color: #ffc107; /* Yellow/Orange for partial actions */
      color: #212529;
  }
  .confirm-btn:hover {
      background-color: #e0a800;
  }

</style> 