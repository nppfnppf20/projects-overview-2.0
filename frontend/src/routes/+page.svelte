<script lang="ts">
  import { selectedProject, updateProject } from "$lib/stores/projectStore";
  
  function handleSubmit(event: Event) {
    event.preventDefault();
    
    if ($selectedProject) {
      // Extract form data and update the project
      updateProject($selectedProject.id, $selectedProject);
      alert("Project information saved successfully!");
    }
  }
</script>

<div class="general-info">
  <h1>General Project Information</h1>
  
  {#if $selectedProject}
    <form class="project-form" on:submit={handleSubmit}>
      <!-- Section: Basic Information -->
      <section class="form-section">
        <h2>Basic Information</h2>
        <div class="form-grid">
          <div class="form-group">
            <label for="clientName">Client (or SPV) Name</label>
            <input type="text" id="clientName" name="clientName" bind:value={$selectedProject.clientName} />
          </div>
          
          <div class="form-group">
            <label for="detailedDescription">Detailed Description of Development</label>
            <textarea id="detailedDescription" name="detailedDescription" rows="4" bind:value={$selectedProject.detailedDescription}></textarea>
          </div>
          
          <div class="form-group">
            <label for="proposedUseDuration">Proposed Use Duration (years)</label>
            <input type="number" id="proposedUseDuration" name="proposedUseDuration" min="0" bind:value={$selectedProject.proposedUseDuration} />
          </div>
          
          <div class="form-group">
            <label>Project Type</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="projectType" value="solar" bind:group={$selectedProject.projectType} /> Solar
              </label>
              <label class="radio-label">
                <input type="radio" name="projectType" value="bess" bind:group={$selectedProject.projectType} /> BESS
              </label>
              <label class="radio-label">
                <input type="radio" name="projectType" value="solarBess" bind:group={$selectedProject.projectType} /> Solar & BESS
              </label>
              <label class="radio-label">
                <input type="radio" name="projectType" value="other" bind:group={$selectedProject.projectType} /> Other
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="address">Address</label>
            <textarea id="address" name="address" rows="3" bind:value={$selectedProject.address}></textarea>
          </div>
          
          <div class="form-group">
            <label for="area">Area (ha)</label>
            <input type="number" id="area" name="area" step="0.01" min="0" bind:value={$selectedProject.area} />
          </div>
          
          <div class="form-group">
            <label for="localPlanningAuthority">Local Planning Authority</label>
            <input type="text" id="localPlanningAuthority" name="localPlanningAuthority" bind:value={$selectedProject.localPlanningAuthority} />
          </div>
          
          <div class="form-group">
            <label for="distributionNetwork">Distribution Network (DNO)</label>
            <input type="text" id="distributionNetwork" name="distributionNetwork" bind:value={$selectedProject.distributionNetwork} />
          </div>
          
          <div class="form-group">
            <label for="siteDesignations">Site Designations</label>
            <textarea id="siteDesignations" name="siteDesignations" rows="3" bind:value={$selectedProject.siteDesignations}></textarea>
          </div>
        </div>
      </section>
      
      <!-- Section: Equipment Specification (Solar) -->
      <section class="form-section">
        <h2>Equipment Specification (Solar)</h2>
        <div class="form-grid">
          <div class="form-group">
            <label for="solarExportCapacity">Solar Export Capacity (MWh)</label>
            <input type="number" id="solarExportCapacity" name="solarExportCapacity" step="0.1" min="0" bind:value={$selectedProject.solarExportCapacity} />
          </div>
          
          <div class="form-group">
            <label for="pvMaxPanelHeight">PV Max Panel Height (m)</label>
            <input type="number" id="pvMaxPanelHeight" name="pvMaxPanelHeight" step="0.01" min="0" bind:value={$selectedProject.pvMaxPanelHeight} />
          </div>
          
          <div class="form-group">
            <label for="fenceHeight">Fence Height (m)</label>
            <input type="number" id="fenceHeight" name="fenceHeight" step="0.01" min="0" bind:value={$selectedProject.fenceHeight} />
          </div>
          
          <div class="form-group">
            <label for="pvClearanceFromGround">PV Clearance from Ground (m)</label>
            <input type="number" id="pvClearanceFromGround" name="pvClearanceFromGround" step="0.01" min="0" bind:value={$selectedProject.pvClearanceFromGround} />
          </div>
          
          <div class="form-group">
            <label for="numberOfSolarPanels">Number of Solar Panels</label>
            <input type="number" id="numberOfSolarPanels" name="numberOfSolarPanels" min="0" bind:value={$selectedProject.numberOfSolarPanels} />
          </div>
          
          <div class="form-group">
            <label for="panelTilt">Panel Tilt (degrees from horizontal)</label>
            <input type="number" id="panelTilt" name="panelTilt" step="0.1" min="0" max="90" bind:value={$selectedProject.panelTilt} />
          </div>
          
          <div class="form-group">
            <label for="panelTiltDirection">Panel Tilt Direction</label>
            <select id="panelTiltDirection" name="panelTiltDirection" bind:value={$selectedProject.panelTiltDirection}>
              <option value="">Select direction</option>
              <option value="N">North</option>
              <option value="NE">North East</option>
              <option value="E">East</option>
              <option value="SE">South East</option>
              <option value="S">South</option>
              <option value="SW">South West</option>
              <option value="W">West</option>
              <option value="NW">North West</option>
            </select>
          </div>
        </div>
      </section>
      
      <!-- Section: Equipment Specification (BESS) -->
      <section class="form-section">
        <h2>Equipment Specification (BESS)</h2>
        <div class="form-grid">
          <div class="form-group">
            <label for="bessExportCapacity">BESS Export Capacity</label>
            <input type="number" id="bessExportCapacity" name="bessExportCapacity" step="0.1" min="0" bind:value={$selectedProject.bessExportCapacity} />
          </div>
          
          <div class="form-group">
            <label for="bessContainers">BESS No. of Containers</label>
            <input type="number" id="bessContainers" name="bessContainers" min="0" bind:value={$selectedProject.bessContainers} />
          </div>
        </div>
      </section>
      
      <!-- Section: Project Metrics -->
      <section class="form-section">
        <h2>Project Metrics</h2>
        <div class="form-grid">
          <div class="form-group">
            <label for="gwhPerYear">GWh per year</label>
            <input type="number" id="gwhPerYear" name="gwhPerYear" step="0.1" min="0" bind:value={$selectedProject.gwhPerYear} />
          </div>
          
          <div class="form-group">
            <label for="homesPowered">Homes powered per year</label>
            <input type="number" id="homesPowered" name="homesPowered" min="0" bind:value={$selectedProject.homesPowered} />
          </div>
          
          <div class="form-group">
            <label for="co2Offset">CO2 tonnes offset per year</label>
            <input type="number" id="co2Offset" name="co2Offset" step="0.1" min="0" bind:value={$selectedProject.co2Offset} />
          </div>
          
          <div class="form-group">
            <label for="equivalentCars">Equivalent no. of cars per year</label>
            <input type="number" id="equivalentCars" name="equivalentCars" min="0" bind:value={$selectedProject.equivalentCars} />
          </div>
        </div>
      </section>
      
      <!-- Section: Information for Surveyors -->
      <section class="form-section">
        <h2>Information for Surveyors</h2>
        <div class="form-grid">
          <div class="form-group">
            <label for="accessArrangements">Access Arrangements</label>
            <textarea id="accessArrangements" name="accessArrangements" rows="3" bind:value={$selectedProject.accessArrangements}></textarea>
          </div>
          
          <div class="form-group">
            <label for="accessContact">Access Contact</label>
            <input type="text" id="accessContact" name="accessContact" bind:value={$selectedProject.accessContact} />
          </div>
          
          <div class="form-group">
            <label for="parkingDetails">Parking Details</label>
            <textarea id="parkingDetails" name="parkingDetails" rows="2" bind:value={$selectedProject.parkingDetails}></textarea>
          </div>
          
          <div class="form-group">
            <label>ATV Use?</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="atvUse" value="yes" bind:group={$selectedProject.atvUse} /> Yes
              </label>
              <label class="radio-label">
                <input type="radio" name="atvUse" value="no" bind:group={$selectedProject.atvUse} /> No
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="additionalNotes">Additional Notes</label>
            <textarea id="additionalNotes" name="additionalNotes" rows="3" bind:value={$selectedProject.additionalNotes}></textarea>
          </div>
          
          <div class="form-group">
            <label for="invoicingDetails">Invoicing Details</label>
            <textarea id="invoicingDetails" name="invoicingDetails" rows="3" bind:value={$selectedProject.invoicingDetails}></textarea>
          </div>
        </div>
      </section>
      
      <div class="form-actions">
        <button type="submit" class="save-btn">Save Project Information</button>
      </div>
    </form>
  {:else}
    <div class="no-project-selected">
      <h2>No Project Selected</h2>
      <p>Please select a project from the dropdown above to edit project information.</p>
    </div>
  {/if}
</div>

<style>
  .general-info {
    padding: 1rem 0;
  }
  
  h1 {
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: #555;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.5rem;
  }
  
  .project-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .form-section {
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 1.5rem;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.25rem;
  }
  
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
  input[type="number"],
  textarea,
  select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    width: 100%;
  }
  
  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .radio-label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: normal;
  }
  
  textarea {
    resize: vertical;
    min-height: 40px;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }
  
  .save-btn {
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 500;
  }
  
  .save-btn:hover {
    background-color: #0069d9;
  }
  
  .no-project-selected {
    text-align: center;
    margin: 2rem auto;
    padding: 2rem;
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    border: 1px solid #dee2e6;
  }
</style>
