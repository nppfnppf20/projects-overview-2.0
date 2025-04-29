<script lang="ts">
  import { selectedProject } from "$lib/stores/projectStore";
</script>

<div class="programme-container">
  <h1>Programme</h1>
  
  {#if $selectedProject}
    <div class="programme-header">
      <h2>Programme for {$selectedProject.name}</h2>
      <button class="add-programme-btn">+ Add Programme Item</button>
    </div>
    
    <div class="programme-content">
      <p class="placeholder-text">Programme content will be added here.</p>
    </div>
  {:else}
    <p>Please select a project to view the programme.</p>
  {/if}
</div>

<style>
  .programme-container {
    padding: 1rem 0;
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .programme-header {
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
  
  .add-programme-btn {
    background-color: #28a745;
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  
  .add-programme-btn:hover {
    background-color: #218838;
  }
  
  .programme-content {
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 2rem;
    min-height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .placeholder-text {
    color: #6c757d;
    font-style: italic;
  }
</style> 