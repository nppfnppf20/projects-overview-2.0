<script lang="ts">
  import { projects, selectedProject, addProject as addProjectToStore } from '$lib/stores/projectStore';
  import { writable } from 'svelte/store';

  let showAddProjectInput = writable(false);
  let newProjectName = '';
  let isCollectionsOpen = writable(false); // Track if collections menu is open

  function toggleAddProjectForm() {
    showAddProjectInput.update(value => !value);
  }

  function toggleCollections() {
    isCollectionsOpen.update(value => !value);
  }

  function handleSelectionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const projectId = target.value;
    const project = $projects.find(p => p.id === projectId);
    if (project) {
      selectedProject.set(project);
    }
  }

  function groupProjects(groupBy: string) {
    // Just close the collections menu for now
    // In a real app, this would filter/group projects
    isCollectionsOpen.set(false);
    // Would also set some state to indicate the current grouping
    console.log(`Group projects by: ${groupBy}`);
  }

  function addNewProject() {
    if (newProjectName.trim()) {
      // Add project to the store
      addProjectToStore(newProjectName.trim());
      newProjectName = '';
      showAddProjectInput.set(false);
    }
  }

  function cancelAddProject() {
    newProjectName = '';
    showAddProjectInput.set(false);
  }
</script>

<div class="project-selector-container">
  {#if !$showAddProjectInput}
    <div class="selector-row">
      <div class="dropdown-container">
        <select
          aria-label="Select Project"
          on:change={handleSelectionChange}
          value={$selectedProject?.id ?? ''}
        >
          <optgroup label="Collections">
            <option value="collections" on:click|preventDefault={toggleCollections}>
              Group By...
            </option>
          </optgroup>
          
          <optgroup label="Projects">
            {#each $projects as project}
              <option value={project.id}>{project.name}</option>
            {/each}
          </optgroup>
        </select>
        
        {#if $isCollectionsOpen}
          <div class="collections-menu">
            <div class="menu-header">Group Projects By:</div>
            <button on:click={() => groupProjects('client')}>Client</button>
            <button on:click={() => groupProjects('employee')}>TRP Employee</button>
            <button on:click={() => groupProjects('surveyor')}>Surveyors</button>
          </div>
        {/if}
      </div>
      <button class="add-button" on:click={toggleAddProjectForm} aria-label="Add new project">+</button>
    </div>
  {:else}
    <div class="add-project-form">
      <input
        type="text"
        bind:value={newProjectName}
        placeholder="Enter new project name"
        aria-label="New project name"
      />
      <button on:click={addNewProject}>Add</button>
      <button on:click={cancelAddProject}>Cancel</button>
    </div>
  {/if}

  {#if $selectedProject}
    <p class="current-project">Current Project: {$selectedProject.name}</p>
  {/if}
</div>

<style>
  .project-selector-container {
    padding: 1rem;
    background-color: #f0f0f0;
    border-bottom: 1px solid #ccc;
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
  }

  .selector-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dropdown-container {
    position: relative;
  }

  select, input[type="text"] {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    min-width: 200px;
  }

  .collections-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    width: 200px;
    z-index: 10;
  }

  .collections-menu .menu-header {
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
    font-weight: bold;
    color: #555;
  }

  .collections-menu button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.75rem;
    border: none;
    background: none;
    cursor: pointer;
    transition: background-color 0.2s;
    margin: 0;
    color: #333;
  }

  .collections-menu button:hover {
    background-color: #f5f5f5;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    margin-left: 0.5rem;
  }

  .add-button {
    padding: 0.35rem 0.7rem;
    font-size: 1.2rem;
    font-weight: bold;
    border-radius: 50%;
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button:last-of-type {
     background-color: #6c757d;
  }

  button:hover {
    opacity: 0.9;
  }

  .add-project-form {
    display: flex;
    align-items: center;
  }

  .current-project {
      font-weight: bold;
      margin-left: auto;
  }
</style> 