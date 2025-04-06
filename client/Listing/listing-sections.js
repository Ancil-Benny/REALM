// Handles section visibility and navigation

// Section references
let listedContainer, requestsContainer, addContainer, newContainer, questionContainer, questionContainerNew;

// Navigation element references
let listedLink, requestedLink, addLink, newLink;

// Update the initializeSections function

function initializeSections() {
    // Get container references
    listedContainer = document.querySelector('.listedContainer');
    requestsContainer = document.querySelector('.requestsContainer');
    addContainer = document.querySelector('.addcontainer');
    newContainer = document.querySelector('.newcontainer');
    questionContainer = document.querySelector('.questioncontainer');
    questionContainerNew = document.querySelector('.questioncontainernew');
    
    // Get navigation link references
    listedLink = document.getElementById('listedlink');
    requestedLink = document.getElementById('requestedlink');
    addLink = document.getElementById('listedaddlink');
    newLink = document.getElementById('requestnewlink');
    
    // Set up event listeners for navigation
    setupNavigationListeners();
    
    // Initialize arrow scroll button
    initializeScrollArrow();

}

function setupNavigationListeners() {
    // Listed items navigation
    listedLink.addEventListener('click', function() {
        showSection(listedContainer);
    });
    
    // Requested items navigation
    requestedLink.addEventListener('click', function() {
        showSection(requestsContainer);
    });
    
    // Add item navigation
    addLink.addEventListener('click', function() {
        showSection(addContainer);
    });
    
    // New request navigation
    newLink.addEventListener('click', function() {
        showSection(newContainer);
    });
}

function showSection(sectionToShow) {
    // Hide all sections
    hideAllSections();
    
    // Show selected section
    sectionToShow.style.display = 'block';
    
    // Scroll to the section
    sectionToShow.scrollIntoView({behavior: "smooth"});
    
    // Adjust scroll position after a delay
    // setTimeout(function() {
    //     smoothScrollBy(0, -350);
    // }, 900);
}

function hideAllSections() {
    listedContainer.style.display = 'none';
    requestsContainer.style.display = 'none';
    addContainer.style.display = 'none';
    newContainer.style.display = 'none';
    questionContainer.style.display = 'none';
    questionContainerNew.style.display = 'none';
}

function initializeScrollArrow() {
    const arrowContainer = document.querySelector('.arrow-container');
    
    // Show/hide arrow based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) { 
            arrowContainer.classList.remove('arrow-hidden');
        } else {
            arrowContainer.classList.add('arrow-hidden');
        }
    });
    
    // Scroll to top when arrow is clicked
    arrowContainer.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}



// Show question form for Add section
function showAddQuestionForm() {
    hideAllSections();
    questionContainer.style.display = 'block';
}

// Show question form for New section
function showNewQuestionForm() {
    hideAllSections();
    questionContainerNew.style.display = 'block';
}

// Return to Add section from question form
function returnToAddSection() {
    hideAllSections();
    addContainer.style.display = 'block';
}

// Return to New section from question form
function returnToNewSection() {
    hideAllSections();
    newContainer.style.display = 'block';
}