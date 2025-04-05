// Card creation and management for listed and requested items

// Store verification answers for both listed and requested items
const verificationAnswers = {};

// Create a card for listed items
function createListedCard(data) {
    const cardBx = document.createElement('div');
    cardBx.className = 'card__bx';
    cardBx.dataset.itemId = data.itemId;
  
    const cardData = document.createElement('div');
    cardData.className = 'card__data';
    cardBx.appendChild(cardData);
  
    // Create icon
    const cardIcon = document.createElement('div');
    cardIcon.className = 'card__icon';
    const icon = document.createElement('i');
    icon.className = 'material-icons card__icon';
    icon.textContent = data.iconName;
    cardIcon.appendChild(icon);
    cardData.appendChild(cardIcon);
  
    // Create content
    const cardContent = document.createElement('div');
    cardContent.className = 'card__content';
    cardData.appendChild(cardContent);
  
    // Add title
    const title = document.createElement('h3');
    title.textContent = data.title;
    cardContent.appendChild(title);
  
    // Add category
    const category = document.createElement('div');
    category.className = 'categorycard';
    category.textContent = data.category;
    cardContent.appendChild(category);
  
    // Add description
    const description = document.createElement('p');
    description.textContent = data.description;
    cardContent.appendChild(description);
  
    // Add detailed description
    const detailedDescription = document.createElement('p');
    detailedDescription.className = 'detailed-description';
    detailedDescription.textContent = data.detailedDescription;
    cardContent.appendChild(detailedDescription);
  
    // Add verification container
    const verificationContainer = createVerificationContainer(data, 'listed');
    cardBx.appendChild(verificationContainer);
  
    // Add claim button - always show "Claim" regardless of status
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = 'Claim';
  
    // Show verification container when Claim is clicked
    link.addEventListener('click', function(event) {
        event.preventDefault();
        verificationContainer.style.display = 'block';
    });
    
    cardContent.appendChild(link);
  
    return cardBx;
}

// Create a card for requested items
function createRequestedCard(data) {
    const cardBx = document.createElement('div');
    cardBx.className = 'card__bxreq';
    cardBx.dataset.itemId = data.itemId;
  
    const cardData = document.createElement('div');
    cardData.className = 'card__datareq';
    cardBx.appendChild(cardData);
  
    // Create icon
    const cardIcon = document.createElement('div');
    cardIcon.className = 'card__iconreq';
    const icon = document.createElement('i');
    icon.className = 'material-icons card__iconreq';
    icon.textContent = data.iconName;
    cardIcon.appendChild(icon);
    cardData.appendChild(cardIcon);
  
    // Create content
    const cardContent = document.createElement('div');
    cardContent.className = 'card__contentreq';
    cardData.appendChild(cardContent);
  
    // Add title
    const title = document.createElement('h3');
    title.textContent = data.title;
    cardContent.appendChild(title);
  
    // Add category
    const category = document.createElement('div');
    category.className = 'categorycardreq';
    category.textContent = data.category;
    cardContent.appendChild(category);
  
    // Add description
    const description = document.createElement('p');
    description.textContent = data.description;
    cardContent.appendChild(description);
  
    // Add detailed description
    const detailedDescription = document.createElement('p');
    detailedDescription.className = 'detailed-descriptionreq';
    detailedDescription.textContent = data.detailedDescription;
    cardContent.appendChild(detailedDescription);
  
    // Add verification container
    const verificationContainer = createVerificationContainer(data, 'requested');
    cardBx.appendChild(verificationContainer);
  
    // Add claim button - always show "Claim" regardless of status
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = 'Claim';
  
    // Show verification container when Claim is clicked
    link.addEventListener('click', function(event) {
        event.preventDefault();
        verificationContainer.style.display = 'block';
    });
    
    cardContent.appendChild(link);
  
    return cardBx;
}

// Render listed items in the container
function renderListedItems(items) {
    const container = document.querySelector('.listedContainer .container');
    
    // Clear existing items
    container.innerHTML = '<p id="searchMessage"></p>';
    
    if (!items || items.length === 0) {
        const noItemsMessage = document.createElement('p');
        noItemsMessage.textContent = 'No listed items available.';
        noItemsMessage.className = 'no-items-message';
        container.appendChild(noItemsMessage);
        return;
    }
    
    // Process items data
    items.forEach(item => {
        // Process description
        let midpoint = Math.floor(item.questions.length / 2);
        if (item.questions.length % 2 !== 0) {
            midpoint++;
        }
        const firstHalf = item.questions.slice(0, midpoint).map(q => q.answer).join(' ');
        const secondHalf = item.questions.slice(midpoint).map(q => q.answer).join(', ');

        // Get verification questions
        const vquestions = item.verificationQuest.map(q => q.question);

        // Create card with item data
        const card = createListedCard({
            title: item.title,
            iconName: item.iconName,
            category: item.category,
            description: firstHalf,
            detailedDescription: secondHalf,
            verificationQuest: vquestions,
            itemId: item._id,
            item: item
        });

        container.appendChild(card);
    });
}

// Render requested items in the container
function renderRequestedItems(items) {
    const container = document.querySelector('.requestsContainer .containerreq');
    
    // Clear existing items
    container.innerHTML = '<p id="searchMessage"></p>';
    
    if (!items || items.length === 0) {
        const noItemsMessage = document.createElement('p');
        noItemsMessage.textContent = 'No requested items available.';
        noItemsMessage.className = 'no-items-message';
        container.appendChild(noItemsMessage);
        return;
    }
    
    // Process items data
    items.forEach(item => {
        // Process description
        let midpoint = Math.floor(item.questions.length / 2);
        if (item.questions.length % 2 !== 0) {
            midpoint++;
        }
        const firstHalf = item.questions.slice(0, midpoint).map(q => q.answer).join(' ');
        const secondHalf = item.questions.slice(midpoint).map(q => q.answer).join(', ');

        // Get verification questions
        const rquestions = item.verificationQuest.map(q => q.question);

        // Create card with item data
        const card = createRequestedCard({
            title: item.title,
            iconName: item.iconName,
            category: item.category,
            description: firstHalf,
            detailedDescription: secondHalf,
            verificationQuest: rquestions,
            itemId: item._id,
            item: item
        });

        container.appendChild(card);
    });
}