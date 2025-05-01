<script lang="ts">
  import { selectedProject, updateProject, allProjects } from "$lib/stores/projectStore";
  import { goto } from "$app/navigation";

  function handleSubmit(event: Event) {
    event.preventDefault();
    
    if ($selectedProject) {
      // Extract form data and update the project
      updateProject($selectedProject.id, $selectedProject);
      alert("Project information saved successfully!");
    }
  }

  function handleProjectUpdate() {
    if ($selectedProject) {
      // Trigger the update function from the store
      // The store itself handles updating the specific project
      updateProject($selectedProject.id, $selectedProject);
    }
  }
</script>

<div class="project-details-container">
  {#if $selectedProject}
    <h2>{$selectedProject.name} - Details</h2>
    
    <form class="project-details-form" on:submit|preventDefault>
      
      <!-- Basic Project Information -->
      <section class="form-section">
        <h3>Basic Information</h3>
        <div class="form-grid">
            <div class="form-group">
              <label for="clientName">Client Name</label>
              <input type="text" id="clientName" name="clientName" bind:value={$selectedProject.clientName} on:change={handleProjectUpdate} />
            </div>
            
            <div class="form-group">
              <label for="spvName">SPV Name</label>
              <input type="text" id="spvName" name="spvName" bind:value={$selectedProject.spvName} on:change={handleProjectUpdate} />
            </div>
            
            <div class="form-group form-group-full">
              <label for="detailedDescription">Detailed Description of Development</label>
              <textarea id="detailedDescription" name="detailedDescription" rows="4" bind:value={$selectedProject.detailedDescription} on:change={handleProjectUpdate}></textarea>
            </div>
            
             <div class="form-group">
              <label for="proposedUseDuration">Proposed Use Duration (Years)</label>
              <input type="number" id="proposedUseDuration" name="proposedUseDuration" min="0" bind:value={$selectedProject.proposedUseDuration} on:change={handleProjectUpdate} />
            </div>
            
             <div class="form-group">
              <label for="projectType">Project Type</label>
              <select id="projectType" name="projectType" bind:value={$selectedProject.projectType} on:change={handleProjectUpdate}>
                  <option value="solar">Solar</option>
                  <option value="bess">BESS</option>
                  <option value="solarBess">Solar + BESS</option>
                  <option value="other">Other</option>
              </select>
            </div>
            
             <div class="form-group form-group-full">
              <label for="address">Address</label>
              <textarea id="address" name="address" rows="3" bind:value={$selectedProject.address} on:change={handleProjectUpdate}></textarea>
            </div>
            
            <div class="form-group">
              <label for="area">Area (ha)</label>
              <input type="number" id="area" name="area" step="0.01" min="0" bind:value={$selectedProject.area} on:change={handleProjectUpdate} />
            </div>
            
            <div class="form-group">
              <label for="localPlanningAuthority">Local Planning Authority</label>
              <input type="text" id="localPlanningAuthority" name="localPlanningAuthority" bind:value={$selectedProject.localPlanningAuthority} on:change={handleProjectUpdate} />
            </div>
            
            <div class="form-group">
              <label for="distributionNetwork">Distribution Network (DNO)</label>
              <input type="text" id="distributionNetwork" name="distributionNetwork" bind:value={$selectedProject.distributionNetwork} on:change={handleProjectUpdate} />
            </div>
            
            <div class="form-group form-group-full">
              <label for="siteDesignations">Site Designations</label>
              <textarea id="siteDesignations" name="siteDesignations" rows="3" bind:value={$selectedProject.siteDesignations} on:change={handleProjectUpdate}></textarea>
            </div>
        </div>
      </section>
      
      <!-- Equipment Specification (Solar) -->
      {#if $selectedProject.projectType === 'solar' || $selectedProject.projectType === 'solarBess'}
        <section class="form-section">
            <h3>Equipment Specification (Solar)</h3>
             <div class="form-grid">
                <div class="form-group">
                  <label for="solarExportCapacity">Solar Export Capacity (MW)</label>
                  <input type="number" id="solarExportCapacity" name="solarExportCapacity" min="0" step="0.1" bind:value={$selectedProject.solarExportCapacity} on:change={handleProjectUpdate} />
                </div>
                <div class="form-group">
                  <label for="pvMaxPanelHeight">PV Max Panel Height (m)</label>
                  <input type="number" id="pvMaxPanelHeight" name="pvMaxPanelHeight" min="0" step="0.1" bind:value={$selectedProject.pvMaxPanelHeight} on:change={handleProjectUpdate} />
                </div>
                <div class="form-group">
                  <label for="fenceHeight">Fence Height (m)</label>
                  <input type="number" id="fenceHeight" name="fenceHeight" min="0" step="0.1" bind:value={$selectedProject.fenceHeight} on:change={handleProjectUpdate} />
                </div>
                <div class="form-group">
                  <label for="pvClearanceFromGround">PV Clearance from Ground (m)</label>
                  <input type="number" id="pvClearanceFromGround" name="pvClearanceFromGround" min="0" step="0.1" bind:value={$selectedProject.pvClearanceFromGround} on:change={handleProjectUpdate} />
                </div>
                <div class="form-group">
                  <label for="numberOfSolarPanels">Number of Solar Panels</label>
                  <input type="number" id="numberOfSolarPanels" name="numberOfSolarPanels" min="0" bind:value={$selectedProject.numberOfSolarPanels} on:change={handleProjectUpdate} />
                </div>
                <div class="form-group">
                  <label for="panelTilt">Panel Tilt (degrees)</label>
                  <input type="number" id="panelTilt" name="panelTilt" min="0" max="90" bind:value={$selectedProject.panelTilt} on:change={handleProjectUpdate} />
                </div>
                <div class="form-group">
                  <label for="panelTiltDirection">Panel Tilt Direction</label>
                  <input type="text" id="panelTiltDirection" name="panelTiltDirection" bind:value={$selectedProject.panelTiltDirection} on:change={handleProjectUpdate} />
                </div>
            </div>
        </section>
      {/if}

      <!-- Equipment Specification (BESS) -->
      {#if $selectedProject.projectType === 'bess' || $selectedProject.projectType === 'solarBess'}
        <section class="form-section">
            <h3>Equipment Specification (BESS)</h3>
            <div class="form-grid">
                <div class="form-group">
                  <label for="bessExportCapacity">BESS Export Capacity (MW)</label>
                  <input type="number" id="bessExportCapacity" name="bessExportCapacity" min="0" step="0.1" bind:value={$selectedProject.bessExportCapacity} on:change={handleProjectUpdate} />
                </div>
                <div class="form-group">
                  <label for="bessContainers">Number of BESS Containers</label>
                  <input type="number" id="bessContainers" name="bessContainers" min="0" bind:value={$selectedProject.bessContainers} on:change={handleProjectUpdate} />
                </div>
            </div>
        </section>
      {/if}
      
      <!-- Project Metrics -->
       <section class="form-section">
            <h3>Project Metrics</h3>
            <div class="form-grid">
                 <div class="form-group">
                  <label for="gwhPerYear">Generation (GWh/year)</label>
                  <input type="number" id="gwhPerYear" name="gwhPerYear" min="0" step="0.1" bind:value={$selectedProject.gwhPerYear} on:change={handleProjectUpdate} />
                </div>
                <div class="form-group">
                  <label for="homesPowered">Homes Powered</label>
                  <input type="number" id="homesPowered" name="homesPowered" min="0" bind:value={$selectedProject.homesPowered} on:change={handleProjectUpdate} />
                </div>
                <div class="form-group">
                  <label for="co2Offset">CO2 Offset (tonnes/year)</label>
                  <input type="number" id="co2Offset" name="co2Offset" min="0" bind:value={$selectedProject.co2Offset} on:change={handleProjectUpdate} />
                </div>
                <div class="form-group">
                  <label for="equivalentCars">Equivalent Cars Removed</label>
                  <input type="number" id="equivalentCars" name="equivalentCars" min="0" bind:value={$selectedProject.equivalentCars} on:change={handleProjectUpdate} />
                </div>
            </div>
       </section>
       
      <!-- Information for Surveyors -->
      <section class="form-section">
          <h3>Information for Surveyors</h3>
           <div class="form-grid">
                <div class="form-group form-group-full">
                  <label for="accessArrangements">Access Arrangements</label>
                  <textarea id="accessArrangements" name="accessArrangements" rows="3" bind:value={$selectedProject.accessArrangements} on:change={handleProjectUpdate}></textarea>
                </div>
                <div class="form-group">
                  <label for="accessContact">Access Contact</label>
                  <input type="text" id="accessContact" name="accessContact" bind:value={$selectedProject.accessContact} on:change={handleProjectUpdate} />
                </div>
                <div class="form-group">
                  <label for="parkingDetails">Parking Details</label>
                  <input type="text" id="parkingDetails" name="parkingDetails" bind:value={$selectedProject.parkingDetails} on:change={handleProjectUpdate} />
                </div>
                <div class="form-group">
                  <label for="atvUse">ATV Use Permitted?</label>
                  <select id="atvUse" name="atvUse" bind:value={$selectedProject.atvUse} on:change={handleProjectUpdate}>
                      <option value={undefined}>Unknown</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                  </select>
                </div>
                 <div class="form-group form-group-full">
                  <label for="additionalNotes">Additional Notes for Surveyors</label>
                  <textarea id="additionalNotes" name="additionalNotes" rows="3" bind:value={$selectedProject.additionalNotes} on:change={handleProjectUpdate}></textarea>
                </div>
                 <div class="form-group form-group-full">
                  <label for="invoicingDetails">Invoicing Details</label>
                  <textarea id="invoicingDetails" name="invoicingDetails" rows="3" bind:value={$selectedProject.invoicingDetails} on:change={handleProjectUpdate}></textarea>
                </div>
           </div>
      </section>

    </form>
    
  {:else}
    <p class="placeholder">Select a project from the sidebar to view details.</p>
  {/if}
</div>

<style>
    .project-details-container {
        padding: 1rem 0; 
        flex-grow: 1; 
        overflow-y: auto; 
        height: calc(100vh - 150px); /* Adjust based on header/footer */
    }
    
    h2 {
        margin-bottom: 1.5rem;
        color: #333;
    }
    
    .placeholder {
        color: #6c757d;
        font-style: italic;
        margin-top: 2rem;
        text-align: center;
    }

    .form-section {
        margin-bottom: 2.5rem;
        background-color: #fff;
        padding: 1.5rem;
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .form-section h3 {
        font-size: 1.3rem;
        color: #495057;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.75rem;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-group-full {
        grid-column: 1 / -1; /* Span full width */
    }

    label {
        font-weight: 500;
        color: #555;
        font-size: 0.9rem;
    }

    input[type="text"],
    input[type="number"],
    input[type="email"],
    select,
    textarea {
        padding: 0.6rem;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 1rem;
        width: 100%; 
        box-sizing: border-box;
    }

    textarea {
        resize: vertical;
    }

    input:focus, select:focus, textarea:focus {
        outline: none;
        border-color: #80bdff;
        box-shadow: 0 0 0 0.1rem rgba(0, 123, 255, 0.25);
    }

</style>
