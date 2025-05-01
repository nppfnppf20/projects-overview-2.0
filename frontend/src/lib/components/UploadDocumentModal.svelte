<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { DocumentCategory } from '$lib/stores/projectStore'; // Import the category type

  const dispatch = createEventDispatcher();

  // Define categories for the dropdown
  const categories: DocumentCategory[] = [
    'Drawing', 
    'Survey Report', 
    'Other'
  ];

  // Form state
  let documentName: string = '';
  let selectedCategory: DocumentCategory = 'Other'; // Default category
  let version: string = '1.0';
  let fileInput: HTMLInputElement;
  let selectedFile: File | null = null;
  let uploadedBy: string = 'Current User'; // Placeholder - replace with actual user later

  // Handle file selection
  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedFile = input.files[0];
      // Optionally pre-fill document name if empty
      if (!documentName.trim()) {
        documentName = selectedFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
      }
    } else {
      selectedFile = null;
    }
  }

  function resetForm() {
      documentName = '';
      selectedCategory = 'Other';
      version = '1.0';
      selectedFile = null;
      uploadedBy = 'Current User';
      if (fileInput) {
          fileInput.value = ''; // Clear the file input visually
      }
  }

  function handleSave() {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }
    if (!documentName.trim()) {
      alert('Please enter a document name.');
      return;
    }

    const currentDate = new Date().toISOString().split('T')[0];

    // Dispatch event with form data and the file object
    dispatch('save', {
      category: selectedCategory,
      documentName: documentName.trim(),
      version: version,
      dateUploaded: currentDate,
      uploadedBy: uploadedBy, // Replace with actual user later
      file: selectedFile // Pass the actual file object
    });
    resetForm();
  }

  function handleCancel() {
    dispatch('cancel');
    resetForm();
  }
</script>

<div class="modal-overlay" on:click|self={handleCancel}> 
  <div class="modal-content upload-modal-content">
    <div class="modal-header">
      <h2>Upload New Document</h2>
      <button class="close-btn" on:click={handleCancel}>×</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="documentName">Document Name</label>
        <input type="text" id="documentName" bind:value={documentName} required />
      </div>

      <div class="form-group">
        <label for="category">Document Category</label>
        <select id="category" bind:value={selectedCategory}>
          {#each categories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label for="version">Version</label>
        <input type="text" id="version" bind:value={version} required />
      </div>

      <div class="form-group">
          <label for="fileUpload">Select File</label>
          <input 
              type="file" 
              id="fileUpload" 
              bind:this={fileInput} 
              on:change={handleFileChange} 
              required 
          />
          {#if selectedFile}
             <span class="file-name-display">Selected: {selectedFile.name}</span>
          {/if}
      </div>
      
      <!-- Hidden or display-only Uploaded By for now -->
      <!-- <p>Uploaded By: {uploadedBy}</p> -->

    </div>
    <div class="modal-footer">
      <button class="cancel-btn" on:click={handleCancel}>Cancel</button>
      <button class="submit-btn" on:click={handleSave} disabled={!selectedFile || !documentName.trim()}>Upload</button>
    </div>
  </div>
</div>

<style>
  /* Basic Modal Styles (reuse from other modals if available, or define here) */
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white; border-radius: 5px;
    width: 90%; max-width: 550px; /* Adjusted width */
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  .modal-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1rem 1.5rem; border-bottom: 1px solid #e9ecef;
  }
  
  .modal-header h2 { font-size: 1.5rem; margin: 0; }
  
  .close-btn {
    background: none; border: none; font-size: 1.5rem;
    cursor: pointer; color: #6c757d;
  }
  
  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem; /* Spacing between form groups */
  }
  
  .modal-footer {
    padding: 1rem 1.5rem; border-top: 1px solid #e9ecef;
    display: flex; justify-content: flex-end; gap: 1rem;
  }
  
  /* Form Styles */
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 500;
    color: #555;
  }
  
  input[type="text"],
  input[type="file"],
  select {
    padding: 0.6rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 1rem;
  }
  
   input[type="file"] {
      padding: 0.4rem; /* Adjust padding for file input */
   }

  input:focus, select:focus {
     outline: none;
     border-color: #80bdff;
     box-shadow: 0 0 0 0.1rem rgba(0, 123, 255, 0.25);
  }

  .file-name-display {
      font-size: 0.85rem;
      color: #6c757d;
      margin-top: 0.25rem;
  }

  /* Button Styles (reuse if possible) */
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
  
  .cancel-btn:hover { background-color: #f8f9fa; }
  .submit-btn:hover { background-color: #0069d9; }
  .submit-btn:disabled { background-color: #6c757d; cursor: not-allowed; }

</style> 