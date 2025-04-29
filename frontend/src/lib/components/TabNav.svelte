<script lang="ts">
  import { page } from '$app/stores';
  
  // Define our tabs
  const tabs = [
    { id: 'general', label: 'General Project Information', path: '/' },
    { id: 'quotes', label: 'Surveyor Quotes', path: '/quotes' },
    { id: 'instructed', label: 'Instructed Surveyors', path: '/instructed' },
    { id: 'reviews', label: 'Surveyor Reviews', path: '/reviews' },
    { id: 'programme', label: 'Programme', path: '/programme' },
    { id: 'documents', label: 'Relevant Documents', path: '/documents' }
  ];
</script>

<nav class="tab-navigation">
  <ul>
    {#each tabs as tab}
      <li class:active={$page.url.pathname === tab.path}>
        <a href={tab.path}>{tab.label}</a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .tab-navigation {
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    margin-bottom: 1rem;
  }

  ul {
    display: flex;
    list-style-type: none;
    margin: 0;
    padding: 0;
    gap: 0.25rem;
  }

  li {
    padding: 0;
  }

  a {
    display: block;
    padding: 0.75rem 1.25rem;
    text-decoration: none;
    color: #495057;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
  }

  a:hover {
    color: #212529;
    border-bottom: 3px solid #ced4da;
  }

  li.active a {
    color: #007bff;
    border-bottom: 3px solid #007bff;
    font-weight: 500;
  }
</style> 