console.log("Script.js loading...");

// Wait for both DOM and window load to ensure everything is ready
window.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded");
    initializeApp();
});

function initializeApp() {
    // Check if data is available
    if (typeof window.appData === 'undefined') {
        console.error("appData is not defined. Waiting 500ms to retry...");
        // Try again after a short delay in case data.js is still loading
        setTimeout(initializeApp, 500);
        return;
    }
    
    console.log("appData available:", window.appData ? "Yes" : "No");
    
    // Check if elements exist
    const classSelect = document.getElementById('class');
    const boardList = document.getElementById('boardList');
    console.log("Class select found:", classSelect ? "Yes" : "No");
    console.log("Board list found:", boardList ? "Yes" : "No");
    
    if (!classSelect) {
        console.error("Class select element not found. Check your HTML for an element with id 'class'.");
        return;
    }
    
    // Populate class dropdown
    console.log("Populating class dropdown with:", window.appData.classOptions);
    window.appData.classOptions.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        classSelect.appendChild(option);
        console.log("Added option:", className);
    });
    
    // Populate board datalist
    if (boardList) {
        window.appData.boardOptions.forEach(board => {
            const option = document.createElement('option');
            option.value = board;
            boardList.appendChild(option);
        });
    } else {
        console.error("Board list element not found");
    }
    
    // Add event listener to class dropdown to update subject options
    classSelect.addEventListener('change', function() {
        updateSubjectOptions(this.value);
    });
    
    // Function to update subject options based on selected class
    function updateSubjectOptions(selectedClass) {
        const subjectList = document.getElementById('subjectList');
        if (!subjectList) {
            console.error("Subject list element not found");
            return;
        }
        
        subjectList.innerHTML = ''; // Clear existing options
        
        if (selectedClass && window.appData.subjectOptions[selectedClass]) {
            window.appData.subjectOptions[selectedClass].forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                subjectList.appendChild(option);
            });
        }
    }
    
    // Form submission handler
    const topicForm = document.getElementById('topicForm');
    if (topicForm) {
        topicForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading indicator
            const loadingElement = document.getElementById('loading');
            const resultsElement = document.getElementById('results');
            
            if (loadingElement) loadingElement.style.display = 'flex';
            if (resultsElement) resultsElement.style.display = 'none';
            
            // Get form data and match it to the expected schema
            const formData = {
                user_id: "user123", // You might want to get this from somewhere else
                class_level: document.getElementById('class').value,
                board: document.getElementById('board').value,
                subject: document.getElementById('subject').value,
                topic: document.getElementById('topic').value
            };
            
            console.log("Form submitted with data:", formData);
            
            // Make the API call to the backend
            fetch('http://localhost:8000/get_topic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log("API response:", data);
                
                displayResults(data);
                
                // Hide loading indicator
                if (loadingElement) loadingElement.style.display = 'none';
                if (resultsElement) resultsElement.style.display = 'block';
            })
            .catch(error => {
                console.error('Error:', error);
                
                // Hide loading indicator and show error
                if (loadingElement) loadingElement.style.display = 'none';
                if (resultsElement) resultsElement.style.display = 'block';
                
                const responseContainer = document.getElementById('responseContainer');
                if (responseContainer) {
                    responseContainer.innerHTML = `<div class="error">Error: ${error.message}</div>`;
                }
            });
        });
    } else {
        console.error("Topic form element not found");
    }
}

function initializeForm() {
    // Populate class dropdown
    const classSelect = document.getElementById('class');
    formData.classes.forEach(classNum => {
        const option = document.createElement('option');
        option.value = `${classNum} class`;
        option.textContent = `Class ${classNum}`;
        classSelect.appendChild(option);
    });
    
    // Populate subject datalist for autocomplete
    const subjectDatalist = document.getElementById('subjectList');
    formData.subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        subjectDatalist.appendChild(option);
    });
    
    // Populate board datalist for autocomplete
    const boardDatalist = document.getElementById('boardList');
    formData.boards.forEach(board => {
        const option = document.createElement('option');
        option.value = board;
        boardDatalist.appendChild(option);
    });
    
    // Set default values for testing/development
    if (process.env.NODE_ENV === 'development') {
        document.getElementById('class').value = '8 class';
        document.getElementById('subject').value = 'Chemistry';
        document.getElementById('board').value = 'CBSE';
        document.getElementById('topic').value = 'Thermodynamics';
    }
}

function setupFormInteractions() {
    // Add focus and blur event listeners for input styling
    const formInputs = document.querySelectorAll('input[type="text"], select');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            
            // Validate on blur
            if (this.hasAttribute('required') && !this.value) {
                this.classList.add('invalid');
            } else {
                this.classList.remove('invalid');
            }
        });
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Show loading spinner
    document.getElementById('loading').style.display = 'block';
    
    // Clear previous results
    document.getElementById('responseContainer').innerHTML = '';
    document.getElementById('questionsContainer').innerHTML = '';
    
    // Get form values
    const classLevel = document.getElementById('class').value;
    const subject = document.getElementById('subject').value;
    const board = document.getElementById('board').value;
    const topic = document.getElementById('topic').value;
    
    // Validate form
    if (!classLevel || !subject || !board || !topic) {
        alert('Please fill in all fields');
        document.getElementById('loading').style.display = 'none';
        return;
    }
    
    try {
        const response = await fetchTopicData(classLevel, subject, board, topic);
        displayResults(response, { classLevel, subject, board, topic });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('responseContainer').innerHTML = `
            <div class="error">
                <p>Error: ${error.message || 'Failed to fetch data'}</p>
            </div>
        `;
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function fetchTopicData(classLevel, subject, board, topic) {
    const apiUrl = 'http://localhost:8000/get_topic';
    
    const requestBody = {
        user_id: "user123", // You might want to get this from somewhere else
        class_level: classLevel,
        board: board,
        subject: subject,
        topic: topic
    };
    
    console.log('Sending request:', requestBody);
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
}

function displayResults(data) {
    // Get the container elements
    const topicContent = document.getElementById('topicContent');
    const questionsList = document.getElementById('questionsList');
    const resultsSection = document.getElementById('results');
    const questionsContainer = document.getElementById('questionsContainer');
    
    // Check if elements exist before using them
    if (!topicContent || !questionsList || !resultsSection) {
        console.error("Required DOM elements not found:", {
            topicContent: !!topicContent,
            questionsList: !!questionsList,
            resultsSection: !!resultsSection
        });
        return;
    }
    
    // Display the response text as markdown
    // Check if marked is available, otherwise fallback to plain text
    if (window.marked) {
        topicContent.innerHTML = marked.parse(data.response);
    } else {
        console.warn("Marked.js not found. Displaying plain text instead of markdown.");
        topicContent.textContent = data.response;
    }
    
    // Clear existing questions
    questionsList.innerHTML = '';
    
    // Add questions to the list - now handling up to 5 questions
    if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        if (questionsContainer) {
            questionsContainer.style.display = 'block';
        }
        
        const formValues = {
            classLevel: document.getElementById('class').value,
            subject: document.getElementById('subject').value,
            board: document.getElementById('board').value,
            topic: document.getElementById('topic').value
        };
        
        // Display up to 5 questions from the API response
        const questionsToDisplay = data.questions.slice(0, 5);
        
        questionsToDisplay.forEach((question, index) => {
            const questionContainer = document.createElement('div');
            questionContainer.className = 'question-container';
            
            const questionHeader = document.createElement('div');
            questionHeader.className = 'question-header';
            
            const expandIcon = document.createElement('span');
            expandIcon.className = 'expand-icon';
            expandIcon.textContent = '+';
            
            const questionText = document.createElement('span');
            questionText.className = 'question-text';
            if (window.marked) {
                questionText.innerHTML = marked.parse(question);
            } else {
                questionText.textContent = question;
            }
            
            const answerDiv = document.createElement('div');
            answerDiv.className = 'answer-container';
            answerDiv.style.display = 'none';
            
            questionHeader.appendChild(expandIcon);
            questionHeader.appendChild(questionText);
            questionContainer.appendChild(questionHeader);
            questionContainer.appendChild(answerDiv);
            
            let isExpanded = false;
            let answerFetched = false;
            
            questionHeader.addEventListener('click', async function() {
                isExpanded = !isExpanded;
                expandIcon.textContent = isExpanded ? '−' : '+';
                answerDiv.style.display = isExpanded ? 'block' : 'none';
                
                if (isExpanded && !answerFetched) {
                    answerDiv.innerHTML = '<div class="answer-loading">Loading answer...</div>';
                    try {
                        const answerData = await fetchAnswer(question, formValues);
                        const answerContent = document.createElement('div');
                        answerContent.className = 'answer-content';
                        
                        if (window.marked && answerData && answerData.response) {
                            answerContent.innerHTML = marked.parse(answerData.response);
                        } else {
                            answerContent.textContent = answerData?.response || 'No answer available';
                        }
                        
                        answerDiv.innerHTML = '';
                        answerDiv.appendChild(answerContent);
                        answerFetched = true;
                    } catch (error) {
                        answerDiv.innerHTML = `<div class="answer-error">Error: ${error.message}</div>`;
                    }
                }
            });
            
            questionsList.appendChild(questionContainer);
        });
    } else {
        if (questionsContainer) {
            questionsContainer.style.display = 'none';
        }
    }
    
    // Show the results section
    resultsSection.style.display = 'block';
    resultsSection.classList.add('visible');
    
    // Log for debugging
    console.log("Questions displayed:", data.questions ? data.questions.length : 0);
}

async function fetchAnswer(question, formValues) {
    const apiUrl = 'http://localhost:8000/get_answer';
    
    const requestBody = {
        user_id: "user123", // You might want to get this from somewhere else
        class_level: formValues.classLevel,
        board: formValues.board,
        subject: formValues.subject,
        topic: formValues.topic,
        question: question
    };
    
    console.log('Fetching answer for:', question);
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Answer response:', data);
    return data;
}