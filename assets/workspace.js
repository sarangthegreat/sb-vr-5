document.addEventListener("DOMContentLoaded", function () {
    console.log('Token on workspace page:', localStorage.getItem('accessToken'));

    const timerElement = document.getElementById('countdown');
    const taskList = document.getElementById('task-list');
    const notesButton = document.getElementById('notes-button');
    const uploadButton = document.getElementById('upload-button');
    const qaButton = document.getElementById('qa-button');
    const dropArea = document.getElementById('drop-area');
    const qaList = document.getElementById('qa-list');
    const notepad = document.getElementById('notepad');
    const submitButton = document.getElementById('submit-button');
    const questionInput = document.getElementById('question-input');
    const submitQuestionButton = document.getElementById('submit-question');
    const uploadFilesButton = document.getElementById('upload-files-button'); // Button to load uploaded files
    const fileList = document.getElementById('file-list'); // Element to display uploaded files

    // Fetch projectId and companyId from query string
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId');
    const companyId = urlParams.get('companyId');

    // Debugging: Log the extracted IDs
    console.log('Extracted Project ID:', projectId);
    console.log('Extracted Company ID:', companyId);

    if (!projectId || !companyId) {
        alert('Project or company ID is missing. Redirecting...');
        window.location.href = '/homepage';
        return;
    }

    // Fetch project details after confirming IDs
    fetchProjectDetails(projectId);

    // Event Listeners for Section Navigation
    notesButton?.addEventListener('click', () => {
        showSection('notes-section');
        loadSavedNotes(); // Load notes when the section is shown
    });

    uploadButton?.addEventListener('click', () => showSection('upload-section'));

    qaButton?.addEventListener('click', () => {
        showSection('qa-section');
        loadQandA(projectId);
    });
    async function submitProject(projectId, forceSubmit = false) {
        let token = localStorage.getItem('accessToken'); // Ensure you're using the correct key
        if (!token) {
            alert('You must be logged in to submit a project.');
            return { ok: false }; // Return an object to indicate failure
        }
    
        console.log('Submitting project with token:', token);
        console.log('Request body before submission:', { forceSubmit }); // Log the request body
    
        try {
            const response = await fetch(`/api/workspace/project/${projectId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Ensure the token is included
                },
                body: JSON.stringify({ forceSubmit }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
                return { ok: false }; // Return an object to indicate failure
            }
    
            const data = await response.json();
            alert('Project submitted successfully!');
            console.log(data);
            return { ok: true, data }; // Return success response
        } catch (error) {
            console.error('Error submitting the project:', error);
            alert('An error occurred while submitting the project.');
            return { ok: false }; // Return an object to indicate failure
        }
    }
    submitButton?.addEventListener('click', async () => {
        const forceSubmit = document.getElementById('force-submit-checkbox').checked; // Get the checkbox state
        console.log('Force submit value:', forceSubmit); // Log the value for debugging
    
        try {
            const submissionResponse = await submitProject(projectId, forceSubmit); // Pass forceSubmit
            if (submissionResponse.ok) {
                const evaluationData = await evaluateProject(projectId);
                alert(`Project evaluated! Quality Score: ${evaluationData.qualityScore}, Points Awarded: ${evaluationData.userPoints}`);
                loadProfileData();
            } else {
                throw new Error('Project submission failed');
            }
        } catch (error) {
            console.error('Error submitting or evaluating the project:', error);
            alert('An error occurred. Please try again.');
        }
    });
    

    // Drag and Drop Event Listeners for File Upload
    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        dropArea.addEventListener('drop', handleDrop);
    }

    // Function to load uploaded files
    async function loadUploadedFiles() {
        try {
            const response = await fetch('/api/workspace/uploads', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
            });
            const data = await response.json();
            console.log('Files response:', data);
    
            const files = data.files || []; // Use default empty array if files is undefined
            fileList.innerHTML = ''; // Clear existing list
    
            files.forEach(file => {
                const listItem = document.createElement('div');
                const userName = file.userId ? file.userId.name : 'Unknown User'; // Check if userId is defined
                const userEmail = file.userId ? file.userId.email : 'Unknown Email'; // Check if userId is defined
    
                listItem.innerHTML = `
                    <p>File Name: ${file.fileName || 'Unknown File'}</p>
                    <p>Uploaded By: ${userName} (${userEmail})</p>
                    <p>File Size: ${file.size || 'Unknown Size'} bytes</p>
                    <p>Uploaded At: ${new Date(file.createdAt).toLocaleString() || 'Unknown Date'}</p>
                    <hr>
                `;
                fileList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error loading uploaded files:', error);
        }
    }
    
    // Call this function when you want to load the uploaded files
    uploadFilesButton?.addEventListener('click', loadUploadedFiles);

    // Fetch project details function
    function fetchProjectDetails(projectId) {
        console.log('Fetching project details for Project ID:', projectId);
        fetch(`/api/workspace/project/${projectId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) throw new Error(`Error: ${response.status}`);
                return response.json();
            })
            .then(project => {
                console.log('Fetched project:', project);
                renderProjectData(project);
                startCountdown(project.submissionDeadline);
            })
            .catch(error => {
                console.error('Error fetching project data:', error);
                alert('Failed to fetch project details. Please try again later.');
            });
    }

    // Render project data into the DOM function
    function renderProjectData(project) {
        document.getElementById('project-title').innerText = `Project: ${project.title}`;
        document.getElementById('project-description').innerText = project.description || 'No description provided.';
        document.getElementById('project-status').innerText = `Status: ${project.status}`;

        taskList.innerHTML = '';
        if (project.tasks?.length) {
            project.tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.addEventListener('change', () => {
                    markTaskComplete(task.taskId, checkbox.checked);
                });

                taskItem.appendChild(checkbox);
                taskItem.appendChild(document.createTextNode(task.taskName));
                taskList.appendChild(taskItem);
            });
        } else {
            taskList.innerHTML = '<p>No tasks found.</p>';
        }
    }

    // Start countdown for project deadline function
    function startCountdown(deadline) {
        const countdown = setInterval(() => {
            const now = new Date();
            const timeRemaining = new Date(deadline) - now;

            if (timeRemaining <= 0) {
                clearInterval(countdown);
                timerElement.innerHTML = "Time's up!";
            } else {
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                timerElement.innerHTML = `${hours}h ${minutes}m ${seconds}s`;
            }
        }, 1000);
    }

    function showSection(sectionId) {
        const sections = ['notes-section', 'upload-section', 'qa-section'];
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = id === sectionId ? 'block' : 'none';
            } else {
                console.warn(`Element with ID '${id}' not found.`);
            }
        });
    }

    function markTaskComplete(taskId, completed) {
        fetch(`/api/workspace/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ completed })
        })
            .then(response => response.json())
            .then(data => console.log('Task updated:', data))
            .catch(error => console.error('Error updating task:', error));
    }

    function loadQandA(projectId) {
        fetch(`/api/qa/${projectId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })
            .then(response => response.json())
            .then(data => {
                qaList.innerHTML = '';
                if (data.qa?.length) {
                    data.qa.forEach(qa => {
                        const qaItem = document.createElement('div');
                        qaItem.className = 'qa-item';
                        qaItem.innerHTML = `
                            <p><strong>Q:</strong> ${qa.question}</p>
                            <p><strong>A:</strong> ${qa.answer || 'Answer pending...'}</p>
                        `;
                        qaList.appendChild(qaItem);
                    });
                } else {
                    qaList.innerHTML = '<p>No Q&A items found.</p>';
                }
            })
            .catch(error => console.error('Error fetching Q&A:', error));
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        ([...files]).forEach(uploadFile);
    }
    function uploadFile(file) {
        const formData = new FormData();
        formData.append('files', file); // Ensure 'file' matches the key expected by your server
    
        fetch('/api/workspace/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: formData, // Correctly pass FormData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to upload file');
                }
                return response.json();
            })
            .then(data => {
                console.log('File uploaded:', data);
                alert('File uploaded successfully!');
            })
            .catch(error => console.error('Error uploading file:', error));
    }
    
  

    function loadSavedNotes() {
        const savedNotes = localStorage.getItem(`notes_${projectId}`);
        notepad.value = savedNotes || '';
    }

    notepad?.addEventListener('input', () => {
        localStorage.setItem(`notes_${projectId}`, notepad.value);
    });

    submitQuestionButton?.addEventListener('click', () => {
        const questionText = questionInput.value.trim();
        if (questionText) {
            submitQuestion(projectId, questionText);
            questionInput.value = '';
        }
    });

    function submitQuestion(projectId, questionText) {
        fetch(`/api/qa/${projectId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ question: questionText })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Question submitted:', data);
                loadQandA(projectId);
            })
            .catch(error => console.error('Error submitting question:', error));
    }
});