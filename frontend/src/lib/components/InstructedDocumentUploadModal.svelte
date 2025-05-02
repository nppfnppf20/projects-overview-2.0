<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let showModal = false;
  export let title = 'Upload Document';
  export let quoteId: string;
  export let documentType: 'quote' | 'instruction'; // To differentiate the upload type

  // Define the NEW status options
  const documentStatuses = [
    'Undergoing TRP review',
    'Undergoing Client Review',
    'TRP/Client comments'
    // Consider adding 'Final Report' or similar if needed
  ] as const; 

  type DocumentStatus = typeof documentStatuses[number];

  let files: FileList | null = null;
  let selectedStatus: DocumentStatus = documentStatuses[0]; // Default to the first status
  let dateUploaded: string = new Date().toISOString().split('T')[0]; // Default to today
  let documentTitle: string = '';
  let documentVersion: string = '';
  let isUploading = false;
  let errorMessage = '';

  const dispatch = createEventDispatcher();

  function close() {
    if (isUploading) return;
    showModal = false;
    // Reset all fields
    files = null; 
    selectedStatus = documentStatuses[0]; 
    dateUploaded = new Date().toISOString().split('T')[0];
    documentTitle = '';
    documentVersion = '';
    errorMessage = '';
    dispatch('close');
  }

  async function handleUpload() {
    if (!files || files.length === 0) {
      errorMessage = 'Please select a file to upload.';
      return;
    }
    // Basic validation for new fields (optional, adjust as needed)
    if (!documentTitle.trim()) {
      errorMessage = 'Please enter a Document Title.';
      return;
    }
     if (!documentVersion.trim()) {
      errorMessage = 'Please enter a Version.';
      return;
    }
    if (isUploading) return;

    isUploading = true;
    errorMessage = '';
    const file = files[0];

    // Simulate upload process including all new fields
    console.log(`Uploading ${documentType} document for quote ${quoteId}:`, {
        fileName: file.name,
        status: selectedStatus,
        title: documentTitle,
        version: documentVersion,
        dateUploaded: dateUploaded
    });
    try {
      // --- Placeholder for actual upload logic ---
      // Example: Send all data to backend
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('quoteId', quoteId);
      // formData.append('documentType', documentType); 
      // formData.append('status', selectedStatus);
      // formData.append('title', documentTitle);
      // formData.append('version', documentVersion);
      // formData.append('dateUploaded', dateUploaded);
      // const response = await fetch('/api/upload-instructed-doc', { method: 'POST', body: formData }); 
      // if (!response.ok) throw new Error('Upload failed');
      // --- End Placeholder ---

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      console.log('Upload successful');
      // Include all new fields in the event payload
      dispatch('uploadComplete', { 
        quoteId, 
        documentType, 
        fileName: file.name, 
        status: selectedStatus, 
        title: documentTitle,
        version: documentVersion,
        dateUploaded: dateUploaded
      });
      close();

    } catch (error) {
      console.error('Upload error:', error);
      errorMessage = `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    } finally {
      isUploading = false;
    }
  }
</script>

{#if showModal}
<div class="modal-overlay" on:click={close}>
  <div class="modal-content" on:click|stopPropagation>
    <div class="modal-header">
      <h2>{title}</h2>
      <button class="close-btn" on:click={close} disabled={isUploading}>×</button>
    </div>

    <div class="modal-body">
      {#if errorMessage}
        <p class="error-message">{errorMessage}</p>
      {/if}
      <div class="form-group">
        <label for="file-upload">Select File:</label>
        <input type="file" id="file-upload" bind:files disabled={isUploading} />
      </div>
      <div class="form-group">
        <label for="document-status">Document Status:</label>
        <select id="document-status" bind:value={selectedStatus} disabled={isUploading}>
          {#each documentStatuses as status}
            <option value={status}>{status}</option>
          {/each}
        </select>
      </div>
      <div class="form-group">
        <label for="document-title">Document Title:</label>
        <input type="text" id="document-title" bind:value={documentTitle} disabled={isUploading} placeholder="e.g., Structural Report" />
      </div>
      <div class="form-group">
        <label for="document-version">Version:</label>
        <input type="text" id="document-version" bind:value={documentVersion} disabled={isUploading} placeholder="e.g., V1.0, Draft A" />
      </div>
      <div class="form-group">
        <label for="date-uploaded">Date uploaded to dashboard:</label>
        <input type="date" id="date-uploaded" bind:value={dateUploaded} disabled={isUploading} />
      </div>
       {#if files && files.length > 0}
        <p>Selected file: {files[0].name}</p>
       {/if}
    </div>

    <div class="modal-footer">
      <button class="cancel-btn" on:click={close} disabled={isUploading}>Cancel</button>
      <button class="submit-btn" on:click={handleUpload} disabled={isUploading || !files || files.length === 0}>
        {#if isUploading}
          Uploading...
        {:else}
          Upload
        {/if}
      </button>
    </div>
  </div>
</div>
{/if}

<style>
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
    z-index: 1050; /* Ensure it's above other modals */
  }

  .modal-content {
    background-color: white;
    border-radius: 5px;
    width: 90%;
    max-width: 500px; /* Smaller max-width for upload */
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
    font-size: 1.3rem;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
  }
   .close-btn:disabled {
     cursor: not-allowed;
     opacity: 0.5;
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

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  label {
    font-weight: 500;
    color: #555;
  }

  input[type="file"], select, input[type="text"], input[type="date"] {
    border: 1px solid #ced4da;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem; 
    background-color: white; 
  }
  input[type="file"]:disabled, select:disabled, input[type="text"]:disabled, input[type="date"]:disabled {
     background-color: #e9ecef;
     cursor: not-allowed;
     opacity: 0.7; 
  }

  .cancel-btn {
    padding: 0.6rem 1.2rem;
    border: 1px solid #ced4da;
    background-color: white;
    border-radius: 4px;
    color: #495057;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .submit-btn {
    padding: 0.6rem 1.2rem;
    border: none;
    background-color: #007bff;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
  }

   .submit-btn:disabled,
   .cancel-btn:disabled {
     cursor: not-allowed;
     opacity: 0.65;
   }

  .cancel-btn:hover:not(:disabled) {
    background-color: #f8f9fa;
  }

  .submit-btn:hover:not(:disabled) {
    background-color: #0069d9;
  }

  .error-message {
      color: #dc3545;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      padding: 0.75rem 1.25rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
  }
</style> 