<script lang="ts">
  import { selectedProject, allQuotes, type Quote } from "$lib/stores/projectStore";
  
  // Filter for instructed quotes based on selected project
  $: instructedQuotes = $selectedProject 
    ? $allQuotes.filter(quote => 
        quote.projectId === $selectedProject.id && quote.instructionStatus === 'instructed'
      ) 
    : [];
</script>

<div class="instructed-container">
  <h1>Instructed Surveyors</h1>
  
  {#if $selectedProject}
    <div class="instructed-header">
      <h2>Surveyors for {$selectedProject.name}</h2>
      <!-- Button removed as instruction happens on Quotes page -->
    </div>
    
    {#if instructedQuotes.length > 0}
      <div class="survey-cards">
        {#each instructedQuotes as quote (quote.id)}
          <div class="surveyor-card">
            <div class="card-header">
              <h3>{quote.organisation}</h3>
              <span class="status-badge status-instructed">
                Instructed
              </span>
            </div>
            
            <div class="card-content">
              <div class="surveyor-detail">
                <i class="icon">👤</i>
                <span>{quote.contactName}</span>
              </div>
              {#if quote.email}
                <div class="surveyor-detail">
                  <i class="icon">📧</i>
                  <span><a href="mailto:{quote.email}">{quote.email}</a></span>
                </div>
              {/if}
              <div class="surveyor-detail">
                <i class="icon">🛠️</i>
                <span>{quote.discipline}</span>
              </div>
              <div class="surveyor-detail">
                <i class="icon">📝</i>
                <span>{quote.surveyType || 'N/A'}</span>
              </div>
              <div class="surveyor-detail">
                <i class="icon">💰</i>
                <span>£{quote.total.toFixed(2)} (excl. VAT)</span>
              </div>
              {#if quote.date}
                <div class="surveyor-detail">
                  <i class="icon">📅</i>
                  <span>Quote Date: {new Date(quote.date).toLocaleDateString()}</span>
                </div>
              {/if}
            </div>
            
            <div class="card-footer">
              <button class="action-btn">View Details</button>
              <button class="action-btn">Send Reminder</button>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="no-data-message">No surveyors have been marked as instructed for this project yet.</p>
    {/if}
    
  {:else}
    <p>Please select a project to view instructed surveyors.</p>
  {/if}
</div>

<style>
  .instructed-container {
    padding: 1rem 0;
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .instructed-header {
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
  
  .survey-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }
  
  .surveyor-card {
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
  }
  
  .surveyor-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  .card-header {
    padding: 1rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  h3 {
    margin: 0;
    color: #495057;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.3rem 0.6rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .status-instructed {
    background-color: #28a745;
    color: white;
  }
  
  .card-content {
    padding: 1rem;
    flex-grow: 1;
  }
  
  .surveyor-detail {
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
  }
  
  .surveyor-detail:last-child {
      margin-bottom: 0;
  }
  
  .icon {
    font-style: normal;
    font-size: 1.1rem;
    width: 1.2em;
    text-align: center;
  }
  
  a {
    color: #007bff;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  
  .card-footer {
    padding: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  
  .action-btn {
    padding: 0.4rem 0.75rem;
    border: none;
    border-radius: 4px;
    background-color: #6c757d;
    color: white;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .action-btn:hover {
    background-color: #5a6268;
  }
  
  .no-data-message {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
    background-color: #f8f9fa;
    border: 1px dashed #ced4da;
    border-radius: 5px;
    margin-top: 1rem;
  }
</style> 