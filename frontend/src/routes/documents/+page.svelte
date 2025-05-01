<script lang="ts">
  import { selectedProject, allDocuments, addDocument, type Document, type DocumentCategory } from "$lib/stores/projectStore";
  import { derived } from "svelte/store";
  import UploadDocumentModal from '$lib/components/UploadDocumentModal.svelte';
  
  // Dummy documents data - this would come from your backend
  const dummyDocuments = [
    { id: 'd1', name: 'Site Plan.pdf', type: 'PDF', size: '2.4 MB', uploadDate: '2023-06-15', category: 'Plans' },
    { id: 'd2', name: 'Environmental Assessment.docx', type: 'DOCX', size: '1.8 MB', uploadDate: '2023-06-20', category: 'Reports' },
    { id: 'd3', name: 'Grid Connection Offer.pdf', type: 'PDF', size: '0.9 MB', uploadDate: '2023-06-22', category: 'Correspondence' },
    { id: 'd4', name: 'Land Registry Title.pdf', type: 'PDF', size: '1.2 MB', uploadDate: '2023-06-10', category: 'Legal' },
    { id: 'd5', name: 'Planning Application Form.pdf', type: 'PDF', size: '3.1 MB', uploadDate: '2023-06-25', category: 'Planning' }
  ];
  
  // Document categories
  const categories = ['All', 'Planning', 'Drawings', 'Surveyor Reports', 'Other'];
  let selectedCategory = 'All';
  
  // Filtering function
  $: filteredDocuments = selectedCategory === 'All' 
    ? dummyDocuments 
    : dummyDocuments.filter(doc => doc.category === selectedCategory);
    
  // Function to get icon based on file type
  function getFileIcon(type: string) {
    switch(type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'xlsx':
        return '📊';
      case 'pptx':
        return '📑';
      case 'jpg':
      case 'png':
        return '🖼️';
      default:
        return '📁';
    }
  }

  // NEW: State for upload modal
  let showUploadModal = false;

  // Derive documents for the selected project
  const projectDocuments = derived(
      [allDocuments, selectedProject],
      ([$allDocs, $project]) => {
          if (!$project) return [];
          return $allDocs.filter(doc => doc.projectId === $project.id);
      }
  );

  function openUploadModal() {
      showUploadModal = true;
  }

  // NEW: Handler for saving the uploaded document metadata
  function handleUploadSave(event: CustomEvent<{
      category: DocumentCategory;
      documentName: string;
      version: string;
      dateUploaded: string;
      uploadedBy: string;
      file: File; // The actual file object
  }>) {
      if (!$selectedProject) return;
      
      const newDocData = event.detail;
      
      // Add the document metadata to the store
      addDocument({
          projectId: $selectedProject.id,
          category: newDocData.category,
          documentName: newDocData.documentName,
          version: newDocData.version,
          dateUploaded: newDocData.dateUploaded,
          uploadedBy: newDocData.uploadedBy, // Replace with real user data later
          fileName: newDocData.file.name // Store the file name
      });
      
      // In a real app, you would now handle the actual file upload
      // (e.g., send newDocData.file to a server endpoint)
      console.log("Simulating upload for:", newDocData.file.name);
      
      showUploadModal = false; // Close the modal
  }

  // NEW: Handler for cancelling the upload modal
  function handleUploadCancel() {
      showUploadModal = false;
  }
</script>

<div class="documents-container">
  <h1>Relevant Documents</h1>
  
  {#if $selectedProject}
    <div class="documents-header">
      <h2>Documents for {$selectedProject.name}</h2>
      <button class="upload-btn" on:click={openUploadModal}>+ Upload New Document</button>
    </div>
    
    <div class="filter-bar">
      <div class="category-filter">
        <span class="filter-label">Filter by category:</span>
        <div class="category-buttons">
          {#each categories as category}
            <button 
              class="category-btn" 
              class:active={selectedCategory === category}
              on:click={() => selectedCategory = category}
            >
              {category}
            </button>
          {/each}
        </div>
      </div>
      
      <div class="search-box">
        <input type="text" placeholder="Search documents..." />
      </div>
    </div>
    
    <div class="documents-table-container">
      <table class="documents-table">
        <thead>
          <tr>
            <th>Document Category</th>
            <th>Document Name</th>
            <th>Version</th>
            <th>Date Uploaded</th>
            <th>Uploaded By</th>
            <th>File Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each $projectDocuments as doc (doc.id)}
            <tr>
              <td>{doc.category}</td>
              <td>{doc.documentName}</td>
              <td>{doc.version}</td>
              <td>{doc.dateUploaded}</td>
              <td>{doc.uploadedBy}</td>
              <td>{doc.fileName}</td>
              <td class="action-cell">
                <button class="action-btn view-btn" title="View Document">View</button>
                <button class="action-btn download-btn" title="Download Document">Download</button>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="7" class="no-data-message">No documents found for this project.</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
  {:else}
    <p>Please select a project to view documents.</p>
  {/if}

  <!-- NEW: Render Upload Modal Conditionally -->
  {#if showUploadModal}
    <UploadDocumentModal on:save={handleUploadSave} on:cancel={handleUploadCancel} />
  {/if}
</div>

<style>
  .documents-container {
    padding: 1rem 0;
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .documents-header {
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
  
  .upload-btn {
    background-color: #17a2b8;
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .upload-btn:hover {
    background-color: #138496;
  }
  
  .filter-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 5px;
    border: 1px solid #e9ecef;
  }
  
  .category-filter {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .filter-label {
    font-weight: 500;
    color: #555;
  }
  
  .category-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .category-btn {
    padding: 0.4rem 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  
  .category-btn.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  
  .search-box input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-width: 250px;
  }
  
  .documents-table-container {
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow-x: auto;
  }
  
  .documents-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
  }
  
  .documents-table th,
  .documents-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
    font-size: 0.95rem;
    white-space: nowrap;
  }
  
  .documents-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
  }
  
  .documents-table tr:last-child td {
    border-bottom: none;
  }
  
  .documents-table tr:hover {
    background-color: #f1f1f1;
  }
  
  .no-data-message {
      text-align: center;
      color: #6c757d;
      padding: 2rem;
  }
  
  .action-cell {
    white-space: nowrap;
  }
  
  .action-btn {
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    margin-right: 0.5rem; 
    transition: opacity 0.2s;
  }

  .action-btn:last-child {
      margin-right: 0;
  }
  
  .view-btn {
    background-color: #6c757d;
    color: white;
  }
  
  .download-btn {
    background-color: #007bff;
    color: white;
  }
  
  .action-btn:hover {
    opacity: 0.85;
  }
</style> 