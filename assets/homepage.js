document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    const searchForm = document.getElementById('searchForm');
    console.log("searchForm:", searchForm);

    if (searchForm) {
        searchForm.addEventListener('submit', fetchProjects); // Attach event listener for search
    } else {
        console.error("Element with ID 'searchForm' not found.");
    }

    fetchCompanyCards(); // Fetch companies when the page loads
});

async function fetchCompanyCards() {
    console.log("Fetching company cards...");
    try {
        const response = await fetch('/api/homepage/companies'); // Fetch companies
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched company data:", data);
        renderCompanyCards(data);
    } catch (error) {
        console.error("Error fetching companies:", error);
    }
}
function renderCompanyCards(companies) {
    const container = document.getElementById('companyCardsContainer');
    console.log("companyCardsContainer:", container);

    if (!container) {
        console.error("Element with ID 'companyCardsContainer' not found.");
        return;
    }

    if (!companies || companies.length === 0) {
        container.innerHTML = '<p>No companies found.</p>';
        return;
    }

    companies.forEach(company => {
        const card = document.createElement('div');
        card.classList.add('company-card');
        card.innerHTML = `
            <h3>${company.name}</h3>
            <p>Description: ${company.description}</p>
            <p>Total Applicants: ${company.totalApplicants}</p>
            <button onclick="viewCompanyProjects('${company._id}')">View Projects</button>
        `;
        container.appendChild(card); // Append new card
    });
}


function viewCompanyProjects(companyId) {
    console.log(`Redirecting to projects for company ID: ${companyId}`);
    window.location.href = `/company/projects?companyId=${companyId}`; // Redirect with query string
}

async function fetchProjects(event) {
    event.preventDefault(); // Prevent default form submission
    const searchQuery = document.getElementById('searchInput').value.trim(); // Get search input value
    console.log("Search query:", searchQuery);

    if (!searchQuery) {
        console.log("Empty search query entered.");
        return; // No search query, do not proceed
    }

    try {
        const response = await fetch(`/api/homepage/projects?search=${encodeURIComponent(searchQuery)}`); // Fetch projects with search query
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const projects = await response.json();
        console.log("Fetched projects:", projects);
        renderProjects(projects); // Render fetched projects
    } catch (error) {
        console.error("Error fetching projects:", error);
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projectsContainer');
    console.log("projectsContainer:", container);

    if (!container) {
        console.error("Element with ID 'projectsContainer' not found.");
        return; // Exit the function if container is not found
    }

    container.innerHTML = ''; // Clear previous projects

    if (projects.length === 0) {
        container.innerHTML = '<p>No projects found.</p>'; // Show message if no projects found
        return;
    }

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.classList.add('project-card');
        projectCard.innerHTML = `
            <h4>${project.title}</h4>
            <p>${project.description}</p>
            <p>Company: ${project.companyId.name}</p>
            <button onclick="viewProjectDetails('${project._id}')">View Details</button>
        `;
        container.appendChild(projectCard);
    });
}

function viewProjectDetails(projectId) {
    console.log(`Redirecting to project details for project ID: ${projectId}`);
    window.location.href = `/project/${projectId}`; // Redirect to project details page
}
