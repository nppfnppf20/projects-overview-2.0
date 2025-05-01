<script lang="ts">
  import {
    selectedProject, 
    allQuotes, 
    addQuote as addQuoteToStore, 
    updateQuote,
    updateQuoteInstructionStatus, 
    deleteQuote,
    type InstructionStatus, 
    type Quote, 
    type LineItem
  } from "$lib/stores/projectStore";
  import LineItemsModal from '$lib/components/LineItemsModal.svelte';
  import PartialInstructionModal from '$lib/components/PartialInstructionModal.svelte';
  
  // Instruction status options for dropdown (can be imported or defined here)
  const instructionStatuses: InstructionStatus[] = [
    'pending', 
    'not instructed', 
    'partially instructed', 
    'instructed'
  ];
  
  // State for new quote modal
  let showNewQuoteModal = false;
  let isEditing = false;
  let quoteToEditId: string | null = null;
  
  // State for viewing line items modal
  let showLineItemsModal = false;
  let selectedQuoteForLineItems: Quote | null = null;
  
  let showPartialInstructionModal = false;
  let quoteForPartialInstruction: Quote | null = null;
  
  // Function to create a blank line item object
  function createNewLineItem(): LineItem {
    return { description: '', cost: 0 };
  }

  // Function to create the initial empty form state
  function createInitialFormState() {
    return {
      discipline: '',
      surveyType: '',
      organisation: '',
      contactName: '',
      email: '',
      lineItems: [createNewLineItem()] as LineItem[],
      additionalNotes: '',
      instructionStatus: 'not instructed' as InstructionStatus,
      status: 'pending' as string,
      date: new Date().toISOString().split('T')[0]
    };
  }

  // New quote/edit quote form data
  let newQuoteForm = createInitialFormState();
  
  function openNewQuoteModal() {
    resetNewQuoteForm();
    isEditing = false;
    quoteToEditId = null;
    showNewQuoteModal = true;
  }
  
  function openEditQuoteModal(quote: Quote) {
    isEditing = true;
    quoteToEditId = quote.id;
    newQuoteForm = {
        ...createInitialFormState(),
        discipline: quote.discipline,
        surveyType: quote.surveyType || '', 
        organisation: quote.organisation,
        contactName: quote.contactName,
        email: quote.email || '', 
        lineItems: quote.lineItems.map(item => ({ ...item })),
        additionalNotes: quote.additionalNotes || '', 
        instructionStatus: quote.instructionStatus,
        status: quote.status || 'pending',
        date: quote.date || new Date().toISOString().split('T')[0]
    };
    if (newQuoteForm.lineItems.length === 0) {
        newQuoteForm.lineItems = [createNewLineItem()];
    }
    showNewQuoteModal = true;
  }
  
  function resetNewQuoteForm() {
    newQuoteForm = createInitialFormState();
  }
  
  function closeNewQuoteModal() {
    showNewQuoteModal = false;
    isEditing = false;
    quoteToEditId = null;
    resetNewQuoteForm();
  }
  
  function addLineItem() {
    newQuoteForm.lineItems = [...newQuoteForm.lineItems, createNewLineItem()];
  }
  
  function removeLineItem(index: number) {
    if (newQuoteForm.lineItems.length > 1) {
        newQuoteForm.lineItems = newQuoteForm.lineItems.filter((_, i) => i !== index);
    } else {
        newQuoteForm.lineItems[0] = createNewLineItem();
    }
  }
  
  function submitQuote() {
    if (!$selectedProject) {
      alert('Please select a project first.');
      return;
    }
    
    if (!newQuoteForm.discipline || !newQuoteForm.organisation || !newQuoteForm.contactName) {
      alert('Please fill in all required fields (Discipline, Organisation, Contact Name).');
      return;
    }
    
    const validLineItems = newQuoteForm.lineItems.filter(item => item.description.trim() !== '');

    if (validLineItems.length === 0 && !isEditing) {
        alert('Please add at least one valid line item with a description.');
        return;
    }
    
    const total = validLineItems.reduce((sum, item) => sum + (item.cost || 0), 0);

    const quoteDataForStore: Partial<Quote> = {
      discipline: newQuoteForm.discipline,
      surveyType: newQuoteForm.surveyType,
      organisation: newQuoteForm.organisation,
      contactName: newQuoteForm.contactName,
      email: newQuoteForm.email,
      lineItems: validLineItems,
      additionalNotes: newQuoteForm.additionalNotes,
      instructionStatus: newQuoteForm.instructionStatus,
      status: newQuoteForm.status,
      date: newQuoteForm.date,
      total: total
    };

    if (isEditing && quoteToEditId) {
      updateQuote(quoteToEditId, quoteDataForStore);
    } else {
      addQuoteToStore({ 
          ...quoteDataForStore, 
          projectId: $selectedProject.id 
      } as Omit<Quote, 'id' | 'total'> & { total: number });
    }
    
    closeNewQuoteModal();
  }
  
  function handleStatusChange(quoteId: string, newStatus: InstructionStatus, event: Event) {
      const target = event.target as HTMLSelectElement;
      const quote = $allQuotes.find(q => q.id === quoteId);
      if (!quote) return;

      const originalStatus = quote.instructionStatus;

      if (newStatus === 'partially instructed') {
          quoteForPartialInstruction = quote;
          showPartialInstructionModal = true;
          setTimeout(() => {
              if (target) target.value = originalStatus;
          }, 0);
      } else {
          updateQuoteInstructionStatus(quoteId, newStatus);
      }
  }
  
  function handleDeleteQuote(quoteId: string, organisationName: string) {
    if (confirm(`Are you sure you want to delete the quote from ${organisationName}? This cannot be undone.`)) {
      deleteQuote(quoteId);
    }
  }
  
  function handlePartialInstructionConfirm() {
      if (!quoteForPartialInstruction) return;
      updateQuoteInstructionStatus(quoteForPartialInstruction.id, 'partially instructed');
      showPartialInstructionModal = false;
      quoteForPartialInstruction = null;
  }

  function handlePartialInstructionCancel() {
      showPartialInstructionModal = false;
      quoteForPartialInstruction = null;
  }
  
  // Calculate total for new quote (now iterates through the array directly)
  $: newQuoteTotal = newQuoteForm.lineItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  
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
                  value={quote.instructionStatus}
                  on:change={(e) => handleStatusChange(quote.id, e.currentTarget.value as InstructionStatus, e)}
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
                <button 
                  class="action-btn edit-btn" 
                  title="Edit Quote"
                  on:click={() => openEditQuoteModal(quote)} 
                >Edit</button>
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
          <h2>{isEditing ? 'Edit Quote' : 'Add New Quote'}</h2>
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
          
          <div class="line-items-input-area">
            {#each newQuoteForm.lineItems as item, index (index)}
              <div class="line-item-input-row">
                 <div class="line-item-inputs">
                    <input 
                      type="text" 
                      placeholder="Description" 
                      bind:value={item.description} 
                      class="line-item-desc-input"
                    />
                    <div class="cost-input-wrapper">
                      <label class="cost-label">£ (excl. VAT)</label>
                      <input 
                        type="number" 
                        placeholder="0" 
                        bind:value={item.cost} 
                        min="0" 
                        step="0.01"
                        class="cost-input"
                      />
                    </div>
                 </div>
                 <button 
                    class="remove-line-item-btn" 
                    title="Remove Line Item"
                    on:click={() => removeLineItem(index)}
                 >×</button>
              </div>
            {/each}
          </div>

          <button class="add-line-item-btn" on:click={addLineItem}>+ Add New Line Item</button>
          
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
          <button class="submit-btn" on:click={submitQuote}>
            {isEditing ? 'Update Quote' : 'Add Quote'}
          </button>
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

  <!-- NEW: Partial Instruction Modal -->
  {#if showPartialInstructionModal && quoteForPartialInstruction}
      <PartialInstructionModal 
          lineItems={quoteForPartialInstruction.lineItems} 
          organisationName={quoteForPartialInstruction.organisation}
          on:confirm={handlePartialInstructionConfirm}
          on:cancel={handlePartialInstructionCancel}
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
  
  .line-items-input-area {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .line-item-input-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
  }
  
  .line-item-inputs {
     display: flex;
     gap: 1rem;
     flex-grow: 1;
     align-items: flex-end;
  }
  
  .line-item-desc-input {
     flex: 1;
     height: 38px;
  }
  
  .cost-input-wrapper {
    display: flex;
    flex-direction: column;
    width: 200px;
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
  
  .remove-line-item-btn {
    background: none;
    border: 1px solid #ced4da;
    color: #dc3545;
    font-size: 1.25rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    flex-shrink: 0;
    transition: background-color 0.2s, color 0.2s;
  }
  
  .remove-line-item-btn:hover {
    background-color: #f8d7da;
    color: #721c24;
    border-color: #f5c6cb;
  }
  
  .add-line-item-btn {
    background: none;
    border: 1px dashed #007bff;
    color: #007bff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    text-align: center;
    transition: all 0.2s;
    font-weight: 500;
    margin-bottom: 1.5rem;
  }
  
  .add-line-item-btn:hover {
    background-color: rgba(0, 123, 255, 0.1);
    color: #0056b3;
    border-style: solid;
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
      font-size: 0.95rem;
      color: #007bff;
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
      font-size: 1.1em;
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
      font-size: 1.3rem;
      cursor: pointer;
      color: #6c757d;
      padding: 0.2rem;
      line-height: 1;
  }
  
  .icon-btn:hover {
      color: #343a40;
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
</style> 