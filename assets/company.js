document.addEventListener("DOMContentLoaded", function() {
    const projectsContainer = document.getElementById('projects-container');
    
    // Ensure the correct part of the path is used for companyId
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('companyId');
    console.log('Company ID:', companyId);
    
    // Check if the companyId is valid
    if (!companyId) {
        projectsContainer.innerHTML = '<p>Invalid company ID. Please provide a valid company ID.</p>';
        console.error('No company ID found in the URL.');
        return;
    }

    const accessToken = localStorage.getItem('accessToken'); // Retrieve token from storage

    if (!accessToken) {
        projectsContainer.innerHTML = '<p>Please log in to view projects.</p>';
        console.error('No access token found.');
        return;
    }

    // Fetch projects from the server with Authorization header
    fetch(`/api/company/projects?companyId=${encodeURIComponent(companyId)}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(projects => {
        if (!Array.isArray(projects)) {
            projectsContainer.innerHTML = '<p>Error loading projects.</p>';
            console.error('Expected an array but got:', projects);
            return;
        }

        if (projects.length === 0) {
            projectsContainer.innerHTML = '<p>No projects available.</p>';
            return;
        }

        // Populate the projects container with project cards
       // Inside the projects.forEach loop where you create the project card
projects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card';
    projectCard.innerHTML = `
        <div class="project-title">${project.title}</div>
        <div class="project-description">${project.description}</div>
        <div class="project-details">
            Deadline: ${new Date(project.submissionDeadline).toLocaleDateString()}<br>
            Applicants: ${project.applicants}
        </div>
        <button class="start-project" data-project-id="${project._id}">Start Project</button>
    `;
    projectsContainer.appendChild(projectCard);
});

// Event listener for 'Start Project' button click
projectsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('start-project')) {
        const projectId = e.target.getAttribute('data-project-id');
        
        // Debugging: Log the projectId
        console.log('Starting project with ID:', projectId);
        
        if (!projectId) {
            console.error('Project ID is missing!');
            return;
        }

        // Redirect to the workspace page with the projectId and companyId in the query string
        const redirectUrl = `/workspace?projectId=${encodeURIComponent(projectId)}&companyId=${encodeURIComponent(companyId)}`;
        console.log('Redirecting to:', redirectUrl); // Debugging: Log the redirect URL
        window.location.href = redirectUrl;
    }
});
    })
    .catch(error => {
        console.error('Error fetching projects:', error);
        projectsContainer.innerHTML = '<p>Error loading projects.</p>';
    });
});
