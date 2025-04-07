// Verification container and verification logic

// Create verification container for listed or requested items
function createVerificationContainer(data, type) {
    // Create main container
    const verificationContainer = document.createElement('div');
    verificationContainer.className = 'verification-container';
    verificationContainer.style.display = 'none';
    
    // Create inner box
    const innerBox = document.createElement('div');
    innerBox.className = 'innerverbox';
    verificationContainer.appendChild(innerBox);
    
    // Create welcome message box
    const welcomeBox = document.createElement('div');
    welcomeBox.className = 'innerverbox2';
    innerBox.appendChild(welcomeBox);
    
    // Add heading
    const heading = document.createElement('h1');
    heading.textContent = 'Making the claim';
    welcomeBox.appendChild(heading);
    
    // Add message
    const message = document.createElement('p');
    message.textContent = 'You need to undergo verification to claim this item. If you understand click next to proceed';
    welcomeBox.appendChild(message);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        verificationContainer.style.display = 'none';
    });
    welcomeBox.appendChild(closeButton);
    
    // Add next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
        welcomeBox.style.display = 'none';
        questionsBox.style.display = 'block';
        questionsBox.style.opacity = 0;
        setTimeout(() => questionsBox.style.opacity = 1, 50);
    });
    welcomeBox.appendChild(nextButton);
    
    // Create questions box
    const questionsBox = document.createElement('div');
    questionsBox.className = 'inner-container';
    questionsBox.style.display = 'none';
    innerBox.appendChild(questionsBox);
    
    // Add heading to questions box
    const questionsHeading = document.createElement('h1');
    questionsHeading.textContent = 'Answer the questions below';
    questionsBox.appendChild(questionsHeading);
    
    // Create form for verification questions
    const form = document.createElement('form');
    form.id = `verification-form-${data.itemId || 'unknown'}`;
    
    // Add itemId as hidden field
    const itemIdInput = document.createElement('input');
    itemIdInput.type = 'hidden';
    itemIdInput.name = 'itemId';
    itemIdInput.value = data.itemId || data.item?.itemId || '';
    form.appendChild(itemIdInput);
    
    // Add type as hidden field (listed or requested)
    const typeInput = document.createElement('input');
    typeInput.type = 'hidden';
    typeInput.name = 'type';
    typeInput.value = type;
    form.appendChild(typeInput);
    
    // Add questions to form
    if (data.verificationQuest && data.verificationQuest.length > 0) {
        data.verificationQuest.forEach((question, index) => {
            const formGroup = document.createElement('div');
            
            const label = document.createElement('label');
            label.setAttribute('for', `question${index}`);
            label.textContent = question;
            formGroup.appendChild(label);
            
            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('id', `question${index}`);
            input.setAttribute('name', `answers[${index}]`);
            input.required = true;
            formGroup.appendChild(input);
            
            form.appendChild(formGroup);
        });
    }
    
    questionsBox.appendChild(form);
    
    // Add close button to questions box
    const questionsCloseButton = document.createElement('button');
    questionsCloseButton.textContent = 'Close';
    questionsCloseButton.addEventListener('click', () => {
        verificationContainer.style.display = 'none';
    });
    questionsBox.appendChild(questionsCloseButton);
    
    // Add verify button to questions box
    const verifyButton = document.createElement('button');
    verifyButton.textContent = 'Verify';
    verifyButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleVerification(form, verificationContainer);
    });
    questionsBox.appendChild(verifyButton);
    
    return verificationContainer;
}

// Handle verification process - send to server for comparison
function handleVerification(form, verificationContainer) {
    // Get form data
    const formData = new FormData(form);
    const data = {
        itemId: formData.get('itemId'),
        type: formData.get('type'),
        answers: []
    };
    
    // Convert FormData to JSON
    for (let pair of formData.entries()) {
        if (pair[0].startsWith('answers[')) {
            const index = parseInt(pair[0].match(/\[(\d+)\]/)[1]);
            data.answers[index] = pair[1];
        }
    }
    
    // Show loading state
    Swal.fire({
        title: 'Verifying...',
        text: 'Please wait while we check your answers',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Send to server for verification
    fetch('http://localhost:3000/api/verify-answers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        // Show verification result with custom styling
        Swal.fire({
            title: result.success ? 'Verification Successful!' : 'Verification Failed',
            html: result.resultHtml,
            icon: result.success ? 'success' : 'error',
            confirmButtonText: 'OK',
            width: 600,
            customClass: {
                htmlContainer: 'verification-results-container'
            }
        });
        
        // update UI 
        if (result.success) {
            const itemCards = document.querySelectorAll(`.card[data-item-id="${data.itemId}"]`);
            itemCards.forEach(card => {
                card.classList.add('verified-item');
                
                // Maybe update the status text or add a badge
                const statusElement = card.querySelector('.item-status');
                if (statusElement) {
                    statusElement.textContent = 'Claimed';
                    statusElement.classList.add('claimed-status');
                }
            });
        }
        
        // Reset form and hide container
        form.reset();
        verificationContainer.style.display = 'none';
    })
    .catch(error => {
        Swal.fire({
            title: 'Verification Error',
            text: 'An error occurred during verification. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
}