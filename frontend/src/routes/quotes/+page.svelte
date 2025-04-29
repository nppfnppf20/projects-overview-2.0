<script lang="ts">
  import {
    selectedProject, 
    allQuotes, 
    addQuote as addQuoteToStore, 
    updateQuoteInstructionStatus, 
    deleteQuote,
    type InstructionStatus, 
    type Quote, 
    type LineItem
  } from "$lib/stores/projectStore";
  import LineItemsModal from '$lib/components/LineItemsModal.svelte';
  
  // Instruction status options for dropdown (can be imported or defined here)
  const instructionStatuses: InstructionStatus[] = [
    'pending', 
    'not instructed', 
    'partially instructed', 
    'instructed'
  ];
  
  // State for new quote modal
  let showNewQuoteModal = false;
  
  // New quote data structure (matching store, excluding fields generated on add)
  let newQuoteForm = {
    discipline: '',
    surveyType: '',
    organisation: '',
    contactName: '',
    email: '',
    lineItems: [] as LineItem[],
    additionalNotes: '',
    instructionStatus: 'not instructed' as InstructionStatus, // Set default
    status: 'pending' as string, // Set default internal status
    date: new Date().toISOString().split('T')[0] // Set default date
  };
  
  // For line item input
  let currentLineItem: LineItem = {
    description: '',
    cost: 0
  };
  
  // State for viewing line items modal
  let showLineItemsModal = false;
  let selectedQuoteForLineItems: Quote | null = null;
  
  function openNewQuoteModal() {
    showNewQuoteModal = true;
  }
  
  function resetNewQuoteForm() {
    newQuoteForm = {
      discipline: '',
      surveyType: '',
      organisation: '',
      contactName: '',
      email: '',
      lineItems: [] as LineItem[],
      additionalNotes: '',
      instructionStatus: 'not instructed' as InstructionStatus,
      status: 'pending' as string,
      date: new Date().toISOString().split('T')[0]
    };
    currentLineItem = {
      description: '',
      cost: 0
    };
  }
  
  function closeNewQuoteModal() {
    showNewQuoteModal = false;
    resetNewQuoteForm();
  }
  
  function addLineItem() {
    if (currentLineItem.description.trim() && currentLineItem.cost >= 0) {
      newQuoteForm.lineItems = [...newQuoteForm.lineItems, { ...currentLineItem }];
      // Reset current line item
      currentLineItem = {
        description: '',
        cost: 0
      };
    }
  }
  
  function removeLineItem(index: number) {
    newQuoteForm.lineItems = newQuoteForm.lineItems.filter((_, i) => i !== index);
  }
  
  function submitNewQuote() {
    if (!$selectedProject) {
      alert('Please select a project first.');
      return;
    }
    
    if (!newQuoteForm.discipline || !newQuoteForm.organisation || !newQuoteForm.contactName) {
      alert('Please fill in all required fields (Discipline, Organisation, Contact Name).');
      return;
    }
    
    // Prepare data for the store function
    const quoteDataForStore = {
      ...newQuoteForm,
      projectId: $selectedProject.id // Add the project ID
    };
    
    addQuoteToStore(quoteDataForStore);
    
    // Close modal and reset
    closeNewQuoteModal();
  }
  
  function handleStatusChange(quoteId: string, newStatus: InstructionStatus) {
      updateQuoteInstructionStatus(quoteId, newStatus);
      // Optionally add feedback like a toast message
  }
  
  function handleDeleteQuote(quoteId: string, organisationName: string) {
    if (confirm(`Are you sure you want to delete the quote from ${organisationName}? This cannot be undone.`)) {
      deleteQuote(quoteId);
      // Note: Related reviews are not automatically deleted by this action yet.
    }
  }
  
  // Calculate total for new quote
  $: newQuoteTotal = newQuoteForm.lineItems.reduce((sum, item) => sum + item.cost, 0);
  
  // Filter quotes based on selected project
  $: filteredQuotes = $selectedProject 
    ? $allQuotes.filter(quote => quote.projectId === $selectedProject.id) 
    : [];

  // Functions for Line Items Modal
  function openLineItemsModal(quote: Quote) {
      selectedQuoteForLineItems = quote;
      showLineItemsModal = true;
  }

  function closeLineItemsModal() {
      showLineItemsModal = false;
      selectedQuoteForLineItems = null;
  }
</script>

<div class="quotes-container">
  <h1>Surveyor Quotes</h1>
  
  {#if $selectedProject}
    <div class="quotes-header">
      <h2>Quotes for {$selectedProject.name}</h2>
      <button class="add-quote-btn" on:click={openNewQuoteModal}>+ Add New Quote</button>
    </div>
    
    <div class="quotes-table-container">
      <table class="quotes-table">
        <thead>
          <tr>
            <th>Discipline</th>
            <th>Survey Type</th>
            <th>Organisation</th>
            <th>Contact Name</th>
            <th>Email</th>
            <th>Line Items</th>
            <th>Total (excl. VAT)</th>
            <th>Instruction Status</th>
            <th>Actions</th>
            <th>Quotes</th>
            <th>Instruction</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredQuotes as quote (quote.id)}
            <tr>
              <td>{quote.discipline}</td>
              <td>{quote.surveyType}</td>
              <td>{quote.organisation}</td>
              <td>{quote.contactName}</td>
              <td><a href="mailto:{quote.email}">{quote.email}</a></td>
              <td class="text-center">
                <button 
                    type="button" 
                    class="line-items-button" 
                    title="View Line Items" 
                    on:click={() => openLineItemsModal(quote)}
                    aria-label={`View ${quote.lineItems.length} line items`}
                >
                  {quote.lineItems.length}
                  <span class="plus-sign">+</span>
                </button>
              </td>
              <td class="text-right">£{quote.total.toFixed(2)}</td>
              <td>
                <select 
                  class="instruction-status-select" 
                  bind:value={quote.instructionStatus}
                  on:change={() => handleStatusChange(quote.id, quote.instructionStatus)}
                >
                  {#each instructionStatuses as status}
                    <option value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  {/each}
                </select>
              </td>
              <td class="action-cell">
                <button 
                  class="action-btn delete-btn" 
                  title="Delete Quote" 
                  on:click={() => handleDeleteQuote(quote.id, quote.organisation)}
                >Delete</button>
                <button class="action-btn edit-btn" title="Edit Quote">Edit</button>
              </td>
              <td class="action-cell icon-cell">
                <button class="action-btn icon-btn" title="Manage Quote Documents (TBD)">📎</button>
              </td>
              <td class="action-cell icon-cell">
                <button class="action-btn icon-btn" title="Manage Instruction Documents (TBD)">📎</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p>Please select a project to view quotes.</p>
  {/if}
  
  <!-- New Quote Modal -->
  {#if showNewQuoteModal}
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add New Quote</h2>
          <button class="close-btn" on:click={closeNewQuoteModal}>×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label for="discipline">Discipline<span class="required">*</span></label>
              <input type="text" id="discipline" bind:value={newQuoteForm.discipline} required />
            </div>
            
            <div class="form-group">
              <label for="surveyType">Survey Type</label>
              <input type="text" id="surveyType" bind:value={newQuoteForm.surveyType} />
            </div>
            
            <div class="form-group">
              <label for="organisation">Organisation<span class="required">*</span></label>
              <input type="text" id="organisation" bind:value={newQuoteForm.organisation} required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="contactName">Contact Name<span class="required">*</span></label>
              <input type="text" id="contactName" bind:value={newQuoteForm.contactName} required />
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" bind:value={newQuoteForm.email} />
            </div>
          </div>
          
          <hr />
          
          <h3>Line Items</h3>
          
          {#if newQuoteForm.lineItems.length > 0}
            <div class="line-items-list">
              {#each newQuoteForm.lineItems as item, index}
                <div class="line-item">
                  <div class="line-item-details">
                    <span class="line-item-desc">{item.description}</span>
                    <span class="line-item-cost">£{item.cost.toFixed(2)}</span>
                  </div>
                  <button class="remove-line-item" on:click={() => removeLineItem(index)}>×</button>
                </div>
              {/each}
            </div>
          {/if}
          
          <div class="add-line-item-container">
            <div class="line-item-form">
              <input type="text" placeholder="Description" bind:value={currentLineItem.description} />
              <div class="cost-input-wrapper">
                <label class="cost-label">£ (excl. VAT)</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  bind:value={currentLineItem.cost} 
                  min="0" 
                  step="0.01"
                  class="cost-input"
                />
              </div>
              <button 
                class="delete-line-item-btn" 
                title="Clear"
                on:click={() => {
                  currentLineItem.description = '';
                  currentLineItem.cost = 0;
                }}
              >×</button>
            </div>
            <button class="add-line-item-btn" on:click={addLineItem}>+ Add Line Item</button>
          </div>
          
          <div class="total-container">
            <span class="total-label">Total: £{newQuoteTotal.toFixed(2)}</span>
          </div>
          
          <h3>Additional Notes</h3>
          <textarea 
            bind:value={newQuoteForm.additionalNotes} 
            rows="4" 
            placeholder="Add any additional information here..."
          ></textarea>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" on:click={closeNewQuoteModal}>Cancel</button>
          <button class="submit-btn" on:click={submitNewQuote}>Add Quote</button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Line Items Modal -->
  {#if showLineItemsModal && selectedQuoteForLineItems}
    <LineItemsModal 
      items={selectedQuoteForLineItems.lineItems} 
      organisationName={selectedQuoteForLineItems.organisation} 
      on:close={closeLineItemsModal} 
    />
  {/if}
</div>

<style>
  .quotes-container {
    padding: 1rem 0;
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .quotes-header {
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
  
  .add-quote-btn {
    background-color: #28a745;
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  
  .add-quote-btn:hover {
    background-color: #218838;
  }
  
  .quotes-table-container {
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow-x: auto;
  }
  
  .quotes-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1200px;
  }
  
  .quotes-table th,
  .quotes-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
    font-size: 0.95rem;
  }
  
  .quotes-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
    white-space: nowrap;
  }
  
  .quotes-table tr:last-child td {
    border-bottom: none;
  }
  
  .quotes-table tr:hover {
    background-color: #f8f9fa;
  }
  
  .text-center {
    text-align: center;
  }
  
  .text-right {
    text-align: right;
  }
  
  .status-badge { /* This remains for the internal status if ever needed */
    display: inline-block;
    padding: 0.3rem 0.6rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: capitalize;
    white-space: nowrap;
  }
  
  .status-pending {
    background-color: #ffc107;
    color: #212529;
  }
  
  .status-accepted {
    background-color: #28a745;
    color: white;
  }
  
  .status-rejected {
    background-color: #dc3545;
    color: white;
  }
  
  .action-cell {
    white-space: nowrap;
  }
  
  .action-btn {
    padding: 0.4rem 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .view-btn, .details-btn {
    background-color: #6c757d;
    color: white;
  }
  
  .edit-btn, .download-btn {
    background-color: #007bff;
    color: white;
  }
  
  .instruct-btn {
    background-color: #28a745;
    color: white;
  }
  
  .action-btn:hover {
    opacity: 0.9;
  }
  
  a {
    color: #007bff;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  
  /* Styling for the new instruction status dropdown */
  .instruction-status-select {
    padding: 0.4rem 0.6rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 0.9rem;
    background-color: white;
    min-width: 150px; /* Adjust as needed */
  }
  
  .instruction-status-select:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.1rem rgba(0, 123, 255, 0.25);
  }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 5px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e9ecef;
  }
  
  .modal-header h2 {
    font-size: 1.5rem;
    margin: 0;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
  
  .form-row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 500;
    color: #555;
  }
  
  .required {
    color: #dc3545;
    margin-left: 2px;
  }
  
  input[type="text"],
  input[type="email"],
  input[type="number"],
  textarea {
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  hr {
    border: 0;
    border-top: 1px solid #e9ecef;
    margin: 1.5rem 0;
  }
  
  h3 {
    font-size: 1.2rem;
    color: #495057;
    margin-bottom: 1rem;
  }
  
  .add-line-item-container {
    margin-bottom: 1.5rem;
  }
  
  .line-item-form {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    align-items: flex-end;
  }
  
  .line-item-form input[type="text"] {
    flex: 1;
    height: 38px;
  }
  
  .cost-input-wrapper {
    display: flex;
    flex-direction: column;
    width: 220px;
  }
  
  .cost-label {
    font-size: 0.875rem;
    color: #495057;
    margin-bottom: 0.25rem;
  }
  
  .cost-input {
    width: 100%;
    border: 1px solid #ced4da;
    border-radius: 4px;
    height: 38px;
    padding: 0.5rem;
  }
  
  .cost-input:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  .delete-line-item-btn {
    background: none;
    border: 1px solid #ced4da;
    color: #dc3545;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  
  .delete-line-item-btn:hover {
    background-color: #f8f9fa;
  }
  
  .add-line-item-btn {
    background: none;
    border: 1px dashed #ced4da;
    color: #6c757d;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    text-align: center;
    transition: all 0.2s;
  }
  
  .add-line-item-btn:hover {
    background-color: #f8f9fa;
    color: #495057;
  }
  
  .line-items-list {
    margin-bottom: 1rem;
  }
  
  .line-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background-color: #f8f9fa;
    margin-bottom: 0.5rem;
    border-radius: 4px;
  }
  
  .line-item-details {
    display: flex;
    justify-content: space-between;
    flex: 1;
    margin-right: 1rem;
  }
  
  .line-item-cost {
    font-weight: 500;
  }
  
  .remove-line-item {
    background: none;
    border: none;
    color: #dc3545;
    cursor: pointer;
    font-size: 1.25rem;
  }
  
  .total-container {
    margin: 1rem 0;
    text-align: right;
  }
  
  .total-label {
    font-size: 1.1rem;
    font-weight: 500;
  }
  
  .cancel-btn {
    padding: 0.6rem 1.5rem;
    border: 1px solid #ced4da;
    background-color: white;
    border-radius: 4px;
    color: #495057;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .submit-btn {
    padding: 0.6rem 1.5rem;
    border: none;
    background-color: #007bff;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
  }
  
  .cancel-btn:hover {
    background-color: #f8f9fa;
  }
  
  .submit-btn:hover {
    background-color: #0069d9;
  }

  .line-items-button {
      background: none;
      border: none;
      padding: 0.2rem 0.5rem;
      cursor: pointer;
      font-size: 0.95rem; /* Match table text */
      color: #007bff; /* Make it look clickable */
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      border-radius: 4px;
  }

  .line-items-button:hover {
      text-decoration: underline;
      background-color: rgba(0, 123, 255, 0.1);
  }

  .plus-sign {
      font-weight: bold;
      font-size: 1.1em; /* Slightly larger plus */
      line-height: 1;
  }

  .delete-btn {
    background-color: #dc3545;
    color: white;
  }

  .icon-cell {
      text-align: center;
  }

  .icon-btn {
      background: none;
      border: none;
      font-size: 1.3rem; /* Larger icon size */
      cursor: pointer;
      color: #6c757d; /* Grey color */
      padding: 0.2rem;
      line-height: 1;
  }
  
  .icon-btn:hover {
      color: #343a40;
  }
</style> 