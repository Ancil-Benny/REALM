// DOM Elements
const chatButton = document.getElementById('chatApp-button');
const chatContainer = document.getElementById('chatApp-container');
const closeButton = document.getElementById('chatApp-close-button');
const chatMessages = document.getElementById('chatApp-messages');
const chatInteraction = document.getElementById('chatApp-interaction');
const answerSummary = document.getElementById('chatApp-answer-summary');
const summaryContent = document.getElementById('chatApp-summary-content');
const searchResults = document.getElementById('chatApp-search-results');
const resultsList = document.getElementById('chatApp-results-list');
const backToSummaryButton = document.getElementById('chatApp-back-button');

// Item categories 
const categoryItems = {
    "Electronics": ["Cell Phone", "Laptop","Keyboard", "Mouse", "Remote"],
    "Accessory": ["Handbag", "Umbrella", "Backpack", "Tie", "Suitcase"],
    "Sports":["Tennis racket", "Sports ball"],
    "Stationery":["Book", "Scissors"],
    "Miscellaneous":["Bottle", "cup", "bowl"]
};

// Standard colors
const standardColors = [
    "Black", "White", "Gray", 
    "Red", "Blue", "Green", "Yellow", 
     "Gold", "Multicolor","No Color"
];

// Chat state
const chatState = {
    isOpen: false,
    currentQuestion: 0,
    answers: {
        category: "",
        itemName: "",
        date: "",
        brand: "",
        color: "",
        extra: ""
    }
};

// Questions sequence
const questions = [
    {
        id: "category",
        text: "What category does the item belong to?",
        type: "options",
        options: Object.keys(categoryItems) // Get all category names
    },
    {
        id: "itemName",
        text: "Which item are you looking for?",
        type: "dynamic", 
        optionsSource: "category"
    },
    {
        id: "date",
        text: "When was it last seen? (Select a date)",
        type: "date",
        optional: true
    },
    {
        id: "brand",
        text: "What brand is it?",
        type: "options",
        options: ["Unknown", "Enter brand..."],
        allowCustom: true,
        optional: true
    },
    {
        id: "color",
        text: "What color is the item?",
        type: "options",
        options: standardColors
    },
    {
        id: "extra",
        text: "Any additional details about the item?",
        type: "options",
        options: ["None", "Add details..."],
        allowCustom: true,
        optional: true
    }
];

// Event listeners
chatButton.addEventListener('click', toggleChat);
closeButton.addEventListener('click', closeChat);
backToSummaryButton.addEventListener('click', backToSummary);

// Show/hide chat window
function toggleChat() {
    if (chatState.isOpen) {
        closeChat();
    } else {
        openChat();
    }
}

function openChat() {
    chatContainer.style.display = 'block';
    chatContainer.classList.add('active'); 
    chatState.isOpen = true;
    
    // If this is the first time opening, or a reset occurred, start the questions
    if (chatState.currentQuestion === 0) {
        setTimeout(() => {
            askNextQuestion();
        }, 500);
    }
}

function closeChat() {
    chatContainer.style.display = 'none';
    chatContainer.classList.remove('active');
    chatState.isOpen = false;
}

// Message functions
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chatApp-message', 'chatApp-user-message');
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chatApp-message', 'chatApp-bot-message');
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Question handling
function askNextQuestion() {
    //  show summary at last
    if (chatState.currentQuestion >= questions.length) {
        showAnswerSummary();
        return;
    }
    
    const question = questions[chatState.currentQuestion];
    addBotMessage(question.text);
    
    // Display appropriate input based on question type
    chatInteraction.innerHTML = '';
    
    if (question.type === "options") {
        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('chatApp-options');
        
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('chatApp-option-button');
            button.textContent = option;
            button.addEventListener('click', () => {
                if (question.allowCustom && option === "Enter brand..." || option === "Add details...") {
                    showCustomInput(question.id);
                } else {
                    handleOptionSelect(question.id, option);
                }
            });
            optionsDiv.appendChild(button);
        });
        
        chatInteraction.appendChild(optionsDiv);
        
        // Add note for optional fields
        if (question.optional) {
            const note = document.createElement('p');
            note.classList.add('chatApp-missing-note');
            note.textContent = "This field is optional. Select 'Unknown' if not applicable.";
            chatInteraction.appendChild(note);
        }
    }
    else if (question.type === "dynamic") {
        // Get the source for options
        const sourceValue = chatState.answers[question.optionsSource];
        const options = categoryItems[sourceValue] || [];
        
        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('chatApp-options');
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('chatApp-option-button');
            button.textContent = option;
            button.addEventListener('click', () => {
                handleOptionSelect(question.id, option);
            });
            optionsDiv.appendChild(button);
        });
        
        chatInteraction.appendChild(optionsDiv);
    }
    else if (question.type === "date") {
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.classList.add('chatApp-date-input');
        dateInput.id = 'chatApp-date-input';
        
        // Set default to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        
        const submitButton = document.createElement('button');
        submitButton.classList.add('chatApp-submit-button');
        submitButton.textContent = 'Continue';
        submitButton.addEventListener('click', () => {
            const date = dateInput.value;
            handleDateSelect(question.id, date);
        });
        
        chatInteraction.appendChild(dateInput);
        chatInteraction.appendChild(submitButton);
        
        if (question.optional) {
            const skipButton = document.createElement('button');
            skipButton.id = 'chatApp-skip-button';
            skipButton.classList.add('chatApp-skip-button');
            skipButton.textContent = 'Unknown date / Skip';
            skipButton.addEventListener('click', () => {
                handleSkip(question.id);
            });
            chatInteraction.appendChild(skipButton);
        }
    }
}

// Show custom input for brand or details
function showCustomInput(questionId) {
    chatInteraction.innerHTML = '';
    
    const inputType = questionId === "extra" ? "textarea" : "input";
    const placeholder = questionId === "extra" ? "Type your details here..." : "Enter brand name...";
    
    const textInput = document.createElement(inputType);
    textInput.type = 'text';
    textInput.classList.add('chatApp-text-input');
    textInput.id = `chatApp-${questionId}-input`;
    textInput.placeholder = placeholder;
    
    if (inputType === "textarea") {
        textInput.rows = 3;
    }
    
    const submitButton = document.createElement('button');
    submitButton.classList.add('chatApp-submit-button');
    submitButton.textContent = 'Continue';
    submitButton.addEventListener('click', () => {
        const text = textInput.value;
        handleTextInput(questionId, text || "Unknown");
    });
    
    const backButton = document.createElement('button');
    backButton.classList.add('chatApp-skip-button');
    backButton.textContent = 'Go back to options';
    backButton.addEventListener('click', () => {
        // Re-ask the current question to show options again
        askNextQuestion();
    });
    
    chatInteraction.appendChild(textInput);
    chatInteraction.appendChild(submitButton);
    chatInteraction.appendChild(backButton);
}

// Handle user responses
function handleOptionSelect(questionId, selectedOption) {
    // Convert "Unknown" to empty string for backend
    const valueToStore = selectedOption === "Unknown" || selectedOption === "None" ? "" : selectedOption;
    
    addUserMessage(selectedOption);
    chatState.answers[questionId] = valueToStore;
    chatState.currentQuestion++;
    setTimeout(askNextQuestion, 500);
}

function handleDateSelect(questionId, selectedDate) {
    // Format the date for display
    const displayDate = new Date(selectedDate).toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });
    
    addUserMessage(displayDate);
    chatState.answers[questionId] = selectedDate;
    chatState.currentQuestion++;
    setTimeout(askNextQuestion, 500);
}

function handleTextInput(questionId, text) {
    // Allow empty for optional fields
    const displayText = text.trim() === "" ? "Unknown" : text;
    addUserMessage(displayText);
    chatState.answers[questionId] = text;
    chatState.currentQuestion++;
    setTimeout(askNextQuestion, 500);
}

function handleSkip(questionId) {
    addUserMessage("Unknown/Not specified");
    chatState.answers[questionId] = "";
    chatState.currentQuestion++;
    setTimeout(askNextQuestion, 500);
}

// Show summary of all answers
function showAnswerSummary() {
    // Hide chat interaction area
    chatInteraction.style.display = 'none';
    
    // Format the date for display
    const displayDate = chatState.answers.date ? 
        new Date(chatState.answers.date).toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        }) : "Unknown";
    
    // Build summary HTML
    let summaryHTML = `
        <p><strong>Category:</strong> ${chatState.answers.category}</p>
        <p><strong>Item:</strong> ${chatState.answers.itemName}</p>
        <p><strong>Last Seen:</strong> ${displayDate}</p>
        <p><strong>Brand:</strong> ${chatState.answers.brand || "Unknown"}</p>
        <p><strong>Color:</strong> ${chatState.answers.color || "Unknown"}</p>
        <p><strong>Additional Details:</strong> ${chatState.answers.extra || "None provided"}</p>
    `;
    
    // Display summary content
    summaryContent.innerHTML = summaryHTML;
    
    // Remove any existing action buttons
    const existingActions = document.querySelector('.chatApp-summary-actions');
    if (existingActions) {
        existingActions.remove();
    }
    
    // Add buttons for search and edit
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('chatApp-summary-actions');
    actionsDiv.innerHTML = `
        <button id="chatApp-search-button" class="chatApp-primary-button">Search</button>
        <button id="chatApp-edit-button" class="chatApp-secondary-button">Edit Answers</button>
    `;
    
    // Append the actions div to the answer summary div
    document.getElementById('chatApp-answer-summary').appendChild(actionsDiv);

    // Add event listeners to the buttons
    document.getElementById('chatApp-search-button').addEventListener('click', handleSearch);
    document.getElementById('chatApp-edit-button').addEventListener('click', editAnswers);
    
    // Display the summary container
    answerSummary.style.display = 'block';
    
    // Add a message indicating completion
    addBotMessage("Here's a summary of your search criteria. You can search now or edit your answers.");
}

// Edit answers
function editAnswers() {
    // Hide summary
    answerSummary.style.display = 'none';
    
    // Show chat interaction area again
    chatInteraction.style.display = 'block';
    
    // Reset to first question
    chatState.currentQuestion = 0;
    
    // Add message about editing
    addBotMessage("Let's update your search criteria. Please answer the questions again.");
    
    // Start questions again
    askNextQuestion();
}

// Update this function to include JWT token and request only needed fields
async function searchItems(criteria) {
    try {
        // Build query string from search criteria
        const queryParams = new URLSearchParams();
        
        if (criteria.category) queryParams.append('category', criteria.category);
        if (criteria.itemName) queryParams.append('objectName', criteria.itemName); // This maps to 'name' in DB
        if (criteria.brand) queryParams.append('brand', criteria.brand);
        if (criteria.color) queryParams.append('color', criteria.color);
        if (criteria.date) queryParams.append('date', criteria.date);
        
        // Add field selection parameter to return only essential fields
        queryParams.append('fields', 'name,person,color,brand,details,location,timestamp');
        
        // Log what we're searching for
        console.log('Searching with criteria:', {
            category: criteria.category,
            objectName: criteria.itemName,
            brand: criteria.brand,
            color: criteria.color,
            date: criteria.date
        });
        
        const apiUrl = `http://localhost:3000/api/items/search?${queryParams}`;
        console.log('API URL:', apiUrl);
        
        // Get JWT token from session storage if available
        const token = sessionStorage.getItem('token');
        
        // Configure request options
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        // Add Authorization header if token exists
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Make API call with headers
        const response = await fetch(apiUrl, options);
        
        if (!response.ok) {
            throw new Error('Failed to fetch search results');
        }
        
        const results = await response.json();
        console.log('Search results:', results);
        return results;
    } catch (error) {
        console.error('Error searching items:', error);
        return []; // Return empty array on error
    }
}

// Update the handleSearch function to use the API
function handleSearch() {
    // Hide summary
    answerSummary.style.display = 'none';
    
    // Show search results area
    searchResults.style.display = 'flex';
    
    // Add message about searching
    addBotMessage("Searching the database for matching items...");
    
    // Make API call to search for items
    searchItems(chatState.answers)
        .then(items => {
            displaySearchResults(items);
        })
        .catch(error => {
            console.error('Search error:', error);
            addBotMessage("Sorry, there was a problem connecting to the database. Using mock data instead.");
            // displayMockResults();
        });
}

// Create new function to display results from backend with only essential fields
function displaySearchResults(items) {
    // Clear previous results
    resultsList.innerHTML = '';
    
    // Check if we found any items
    if (items.length === 0) {
        resultsList.innerHTML = `
            <div class="chatApp-no-results">
                <p>No items matching your criteria were found.</p>
            </div>
        `;
        addBotMessage("I couldn't find any items matching your search criteria.");
        return;
    }
    
    // Display each item with only essential fields
    items.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('chatApp-result-item');
        
        // Format date for display
        const timestamp = new Date(item.timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        resultItem.innerHTML = `
            <div class="chatApp-result-header">
                <h4>${item.name}</h4>
                <span class="chatApp-result-timestamp">${timestamp}</span>
            </div>
            <div class="chatApp-result-details">
                <p><strong>Person:</strong> ${item.person || 'Unknown'}</p>
                <p><strong>Color:</strong> ${item.color || 'Not specified'}</p>
                ${item.brand ? `<p><strong>Brand:</strong> ${item.brand}</p>` : ''}
                ${item.details ? `<p><strong>Details:</strong> ${item.details}</p>` : ''}
                ${item.location ? `<p><strong>Location:</strong> ${item.location}</p>` : ''}
            </div>
        `;
        
        resultsList.appendChild(resultItem);
    });
    
    addBotMessage(`Found ${items.length} item(s) matching your search criteria.`);
}

// Go back to summary
function backToSummary() {
    searchResults.style.display = 'none';
    answerSummary.style.display = 'block';
}

// // Display mock search results
// function displayMockResults() {
//     // Clear previous results
//     resultsList.innerHTML = '';
    
//     // Mock results based on search criteria
//     const mockResults = [];
    
//     // Create mocks based on item name
//     if (chatState.answers.itemName.toLowerCase().includes("phone")) {
//         mockResults.push({
//             objectName: "Cell Phone",  
//             timestamp: new Date("2025-03-19T14:30:00").toISOString(),
//             person: "Unknown",
//             color: chatState.answers.color || "Black",
//             category: "Electronics",
//             brand: chatState.answers.brand || "Apple",
//             details: "iPhone with black case"
//         });
//     } 
 
    
//     // Display results
//     if (mockResults.length === 0) {
//         resultsList.innerHTML = `
//             <div class="chatApp-no-results">
//                 <p>No items matching your criteria were found.</p>
//             </div>
//         `;
//         addBotMessage("I couldn't find any items matching your search criteria.");
//     } else {
//         mockResults.forEach(result => {
//             const resultItem = document.createElement('div');
//             resultItem.classList.add('chatApp-result-item');  
            
//             // Format date for display
//             const timestamp = new Date(result.timestamp).toLocaleString('en-US', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit'
//             });
            
//             resultItem.innerHTML = `
//                 <div class="chatApp-result-header">
//                     <h4>${result.objectName}</h4>
//                     <span class="chatApp-result-timestamp">${timestamp}</span>
//                 </div>
//                 <div class="chatApp-result-details">
//                     <p><strong>Person:</strong> ${result.person}</p>
//                     <p><strong>Color:</strong> ${result.color}</p>
//                     <p><strong>Category:</strong> ${result.category}</p>
//                     <p><strong>Brand:</strong> ${result.brand || 'Unknown'}</p>
//                     <p><strong>Details:</strong> ${result.details || 'No additional details'}</p>
//                 </div>
//             `;
            
//             resultsList.appendChild(resultItem); 
//         });
        
//         addBotMessage(`Found ${mockResults.length} item(s) matching your search criteria.`);
//     }
// }

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Initially the chat is closed
});