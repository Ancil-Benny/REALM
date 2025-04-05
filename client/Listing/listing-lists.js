// List item creation and handling for Add and New sections

// Initialize the material lists for Add and New sections
let materialList, materialListNew;

// Initialize the list containers
function initializeListContainers() {
    const addContainer = document.querySelector('.addcontainer');
    const newContainer = document.querySelector('.newcontainer');
    
    if (!addContainer) {
        showAlert('error', 'Error', 'Add container not found in the DOM');
        return;
    }
    
    if (!newContainer) {
        showAlert('error', 'Error', 'New container not found in the DOM');
        return;
    }
    
    // Clear any existing lists to avoid duplicates
    addContainer.querySelectorAll('.material-list').forEach(list => list.remove());
    newContainer.querySelectorAll('.material-list-new').forEach(list => list.remove());
    
    // Create material list for Add section
    materialList = document.createElement('ul');
    materialList.className = 'material-list';
    addContainer.appendChild(materialList);
    
    // Create material list for New section
    materialListNew = document.createElement('ul');
    materialListNew.className = 'material-list-new';
    newContainer.appendChild(materialListNew);
}

// Create a list item for Add section
function createListItem(data) {
    // console.log('Creating list item for Add section:', data);
    const listItem = document.createElement('li');
    listItem.className = 'material-list-item';
    listItem.dataset.id = Date.now().toString();
    listItem.dataset.icon = data.icon;
    listItem.dataset.category = data.category;
    
    // Store questions as data attributes (as JSON strings)
    listItem.setAttribute('data-questions', JSON.stringify(data.questions || []));
    listItem.setAttribute('data-verificationQuest', JSON.stringify(data.verificationQuest || []));
    
    // Create icon
    const icon = document.createElement('i');
    icon.className = 'material-icons';
    icon.textContent = data.icon;
    listItem.appendChild(icon);
    
    // Create content container
    const itemContent = document.createElement('div');
    itemContent.className = 'item-content';
    listItem.appendChild(itemContent);
    
    // Add title
    const itemTitle = document.createElement('span');
    itemTitle.className = 'item-title';
    itemTitle.textContent = data.name; 
    itemContent.appendChild(itemTitle);
    
    // Add category
    const itemCategory = document.createElement('span');
    itemCategory.className = 'item-category';
    itemCategory.textContent = data.category;
    itemContent.appendChild(itemCategory);
    
    // Add description (hidden)
    const itemDescription = document.createElement('span');
    itemDescription.className = 'item-description';
    itemDescription.textContent = data.description || '';
    itemDescription.style.display = 'none';
    itemContent.appendChild(itemDescription);
    
    // Add color block
    const solidBlock = document.createElement('div');
    solidBlock.className = 'solid-block';
    solidBlock.style.backgroundColor = getRandomColor();
    listItem.appendChild(solidBlock);
    
    // Add button
    const itemButton = document.createElement('button');
    itemButton.className = 'item-button';
    itemButton.textContent = 'Go';
    
    // Add click event for the button
    itemButton.addEventListener('click', function() {
        handleListItemClick(listItem, 'add');
    });
    
    listItem.appendChild(itemButton);
    
    return listItem;
}

// Create a list item for New section
function createListItemNew(data) {
    // console.log('Creating list item for New section:', data);
    const listItem = document.createElement('li');
    listItem.className = 'material-list-item-new';
    listItem.dataset.id = Date.now().toString();
    listItem.dataset.icon = data.icon;
    listItem.dataset.category = data.category;
    
    // Store questions as data attributes (as JSON strings)
    listItem.setAttribute('data-questions', JSON.stringify(data.questions || []));
    listItem.setAttribute('data-verificationQuest', JSON.stringify(data.verificationQuest || []));
    
    // Create icon
    const icon = document.createElement('i');
    icon.className = 'material-icons';
    icon.textContent = data.icon;
    listItem.appendChild(icon);
    
    // Create content container
    const itemContent = document.createElement('div');
    itemContent.className = 'item-content-new';
    listItem.appendChild(itemContent);
    
    // Add title
    const itemTitle = document.createElement('span');
    itemTitle.className = 'item-title-new';
    itemTitle.textContent = data.name; 
    itemContent.appendChild(itemTitle);
    
    // Add category
    const itemCategory = document.createElement('span');
    itemCategory.className = 'item-category-new';
    itemCategory.textContent = data.category;
    itemContent.appendChild(itemCategory);
    
    // Add description (hidden)
    const itemDescription = document.createElement('span');
    itemDescription.className = 'item-description-new';
    itemDescription.textContent = data.description || '';
    itemDescription.style.display = 'none';
    itemContent.appendChild(itemDescription);
    
    // Add color block
    const solidBlock = document.createElement('div');
    solidBlock.className = 'solid-block-new';
    solidBlock.style.backgroundColor = getRandomColor();
    listItem.appendChild(solidBlock);
    
    // Add button
    const itemButton = document.createElement('button');
    itemButton.className = 'item-button-new';
    itemButton.textContent = 'Go';
    
    // Add click event for the button
    itemButton.addEventListener('click', function() {
        handleListItemClick(listItem, 'new');
    });
    
    listItem.appendChild(itemButton);
    
    return listItem;
}

// Handle list item click for both Add and New sections
function handleListItemClick(listItem, section) {
    // Get the questions from the list item
    const questions = JSON.parse(listItem.getAttribute('data-questions') || '[]');
    const verificationQuest = JSON.parse(listItem.getAttribute('data-verificationQuest') || '[]');
    
    // Get container references
    const questionContainer = section === 'add' 
        ? document.querySelector('.questioncontainer')
        : document.querySelector('.questioncontainernew');
    
    // Hide all sections
    hideAllSections();
    
    // Show question container
    questionContainer.style.display = 'block';
    
    // Clear previous form
    questionContainer.innerHTML = '';
    
    // Create form
    const form = document.createElement('form');
    form.className = section === 'add' ? 'material-form' : 'material-form-new';
    
    // Store the item details in hidden fields
    const titleInput = document.createElement('input');
    titleInput.type = 'hidden';
    titleInput.name = 'title';
    titleInput.value = section === 'add' 
        ? listItem.querySelector('.item-title').textContent 
        : listItem.querySelector('.item-title-new').textContent;
    form.appendChild(titleInput);
    
    const iconInput = document.createElement('input');
    iconInput.type = 'hidden';
    iconInput.name = 'iconName';
    iconInput.value = listItem.dataset.icon;
    form.appendChild(iconInput);
    
    const categoryInput = document.createElement('input');
    categoryInput.type = 'hidden';
    categoryInput.name = 'category';
    categoryInput.value = listItem.dataset.category;
    form.appendChild(categoryInput);
    
    // Add form title
    const formTitle = document.createElement('h2');
    formTitle.className = 'form-heading';
    formTitle.textContent = section === 'add' 
        ? listItem.querySelector('.item-title').textContent 
        : listItem.querySelector('.item-title-new').textContent;
    form.appendChild(formTitle);
    
    // Add back button
    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = section === 'add' ? 'back-button' : 'back-button-new';
    backButton.textContent = 'Back';
    backButton.addEventListener('click', function(e) {
        e.preventDefault();
        if (section === 'add') {
            returnToAddSection();
        } else {
            returnToNewSection();
        }
    });
    form.appendChild(backButton);
    
    // Add regular questions
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-container';
        
        const questionLabel = document.createElement('label');
        questionLabel.className = section === 'add' ? 'question-label' : 'question-label-new';
        questionLabel.textContent = question.question;
        questionDiv.appendChild(questionLabel);
        
        const questionInput = document.createElement('input');
        questionInput.className = section === 'add' ? 'question-input' : 'question-input-new';
        questionInput.type = 'text';
        questionInput.name = `questions[${index}][question]`;
        questionInput.value = question.question;
        questionInput.style.display = 'none'; // Hide the question
        questionDiv.appendChild(questionInput);
        
        const answerInput = document.createElement('input');
        answerInput.className = section === 'add' ? 'question-input' : 'question-input-new';
        answerInput.type = 'text';
        answerInput.name = `questions[${index}][answer]`;
        answerInput.placeholder = 'Your answer';
        answerInput.required = true;
        questionDiv.appendChild(answerInput);
        
        form.appendChild(questionDiv);
    });
    
    // Add verification questions
    verificationQuest.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-container';
        
        const questionLabel = document.createElement('label');
        questionLabel.className = section === 'add' ? 'question-label' : 'question-label-new';
        questionLabel.textContent = question.question + ' (Verification)';
        questionDiv.appendChild(questionLabel);
        
        const questionInput = document.createElement('input');
        questionInput.className = section === 'add' ? 'question-input' : 'question-input-new';
        questionInput.type = 'text';
        questionInput.name = `verificationQuest[${index}][question]`;
        questionInput.value = question.question;
        questionInput.style.display = 'none'; // Hide the question
        questionDiv.appendChild(questionInput);
        
        const answerInput = document.createElement('input');
        answerInput.className = section === 'add' ? 'question-input' : 'question-input-new';
        answerInput.type = 'text';
        answerInput.name = `verificationQuest[${index}][answer]`;
        answerInput.placeholder = 'Your answer (this will be used for verification)';
        answerInput.required = true;
        questionDiv.appendChild(answerInput);
        
        form.appendChild(questionDiv);
    });
    
    // Add submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = section === 'add' ? 'submit-button' : 'submit-button-new';
    submitButton.textContent = 'Submit';
    form.appendChild(submitButton);
    
    // Add form submit handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        
        // Gather form data
        const formData = new FormData(e.target);
        const formObject = {};
        
        // Basic form fields
        formObject.title = formData.get('title');
        formObject.iconName = formData.get('iconName');
        formObject.category = formData.get('category');
        
        // Process questions
        const questionsArray = [];
        const verificationQuestArray = [];
        
        // Find all question inputs (using the pattern from field names)
        for (let pair of formData.entries()) {
            const key = pair[0];
            const value = pair[1];
            
            if (key.startsWith('questions[')) {
                const match = key.match(/questions\[(\d+)\]\[(\w+)\]/);
                if (match) {
                    const index = parseInt(match[1]);
                    const field = match[2];
                    
                    // Initialize the question object if it doesn't exist
                    if (!questionsArray[index]) {
                        questionsArray[index] = {};
                    }
                    
                    // Set the field value
                    questionsArray[index][field] = value;
                }
            } else if (key.startsWith('verificationQuest[')) {
                const match = key.match(/verificationQuest\[(\d+)\]\[(\w+)\]/);
                if (match) {
                    const index = parseInt(match[1]);
                    const field = match[2];
                    
                    // Initialize the question object if it doesn't exist
                    if (!verificationQuestArray[index]) {
                        verificationQuestArray[index] = {};
                    }
                    
                    // Set the field value
                    verificationQuestArray[index][field] = value;
                }
            }
        }
        
        // Remove any undefined entries from arrays
        formObject.questions = questionsArray.filter(q => q !== undefined);
        formObject.verificationQuest = verificationQuestArray.filter(q => q !== undefined);
        
        // console.log('Submitting form data:', formObject);
        
        // Submit to the appropriate endpoint
        if (section === 'add') {
            submitListedItem(formObject)
                .then(response => {
                    // Success - refresh the listed items
                    loadListedItems();
                    
                    // Show success message
                    showAlert('success', 'Success', 'Item added successfully!');
                    
                    // Return to the Add section
                    returnToAddSection();
                })
                .catch(error => {
                    console.error('Error submitting listed item:', error);
                    
                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit';
                    
                    // Show error message
                    showAlert('error', 'Error', 'Failed to submit item. Please try again.');
                });
        } else {
            submitRequestedItem(formObject)
                .then(response => {
                    // Success - refresh the requested items
                    loadRequestedItems();
                    
                    // Show success message
                    showAlert('success', 'Success', 'Request added successfully!');
                    
                    // Return to the New section
                    returnToNewSection();
                })
                .catch(error => {
                    console.error('Error submitting requested item:', error);
                    
                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit';
                    
                    // Show error message
                    showAlert('error', 'Error', 'Failed to submit request. Please try again.');
                });
        }
    });
    
    questionContainer.appendChild(form);
    
    // Scroll to the form
    form.scrollIntoView({ behavior: 'smooth' });
}

// Render categories for Add section
function renderAddCategories(categories) {

    if (!materialList) {
        initializeListContainers();
    }
    
    // Clear current list
    materialList.innerHTML = '';
    
    if (!categories || categories.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No categories available';
        materialList.appendChild(emptyMessage);
        return;
    }
    
    // Create list items
    categories.forEach(category => {
        const listItem = createListItem(category);
        materialList.appendChild(listItem);
    });
}

// Render categories for New section
function renderNewCategories(categories) {
 
    if (!materialListNew) {
        initializeListContainers();
    }
    
    // Clear current list
    materialListNew.innerHTML = '';
    
    if (!categories || categories.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No categories available';
        materialListNew.appendChild(emptyMessage);
        return;
    }
    
    // Create list items
    categories.forEach(category => {
        const listItem = createListItemNew(category);
        materialListNew.appendChild(listItem);
    });
}