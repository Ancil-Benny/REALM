// API calls to backend services

// Get authentication token from sessionStorage
function getAuthToken() {
  return sessionStorage.getItem('token');
}

// Load listed items from API
function loadListedItems() {
  fetch('http://localhost:3000/api/listeditems')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Assuming data is an array of items
      renderListedItems(data);
    })
    .catch(error => {
      showAlert('error', 'Error', 'Failed to load listed items. Please try again later.');
    });
}

// Load requested items from API
function loadRequestedItems() {
  fetch('http://localhost:3000/api/reqitems')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {

      renderRequestedItems(data);
    })
    .catch(error => {
      showAlert('error', 'Error', 'Failed to load requested items. Please try again later.');
    });
}

// Load categories for Add section
function loadAddItemsCategories() {
  initializeListContainers(); // Initialize containers immediately
  
  fetch('http://localhost:3000/additems')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Transform the data to match the format expected by renderAddCategories
        const formattedCategories = data.additems.map(item => ({
          name: item.name,
          icon: item.icon,
          category: item.category,
          questions: item.questions.map(q => ({ question: q, answer: '' })),
          verificationQuest: item.verificationQuest.map(q => ({ question: q, answer: '' }))
        }));
        
        renderAddCategories(formattedCategories);
      } else {
        throw new Error(data.error || 'Failed to load categories');
      }
    })
    .catch(error => {
      showAlert('error', 'Error', 'Failed to load categories. Please check your connection and try again.');
    });
}

// Load categories for New section (uses same endpoint as Add)
function loadNewRequestCategories() {
  if (!materialListNew) {
    initializeListContainers(); 
  }
  
  fetch('http://localhost:3000/additems')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Transform the data to match the format expected by renderNewCategories
        const formattedCategories = data.additems.map(item => ({
          name: item.name,
          icon: item.icon,
          category: item.category,
          questions: item.questions.map(q => ({ question: q, answer: '' })),
          verificationQuest: item.verificationQuest.map(q => ({ question: q, answer: '' }))
        }));
        
        renderNewCategories(formattedCategories);
      } else {
        throw new Error(data.error || 'Failed to load categories');
      }
    })
    .catch(error => {
      showAlert('error', 'Error', 'Failed to load categories. Please check your connection and try again.');
    });
}

// Submit a new listed item (from Add section)
function submitListedItem(formData) {
  const token = getAuthToken();
  
  if (!token) {
    showAlert('error', 'Authentication Required', 'You must be logged in to submit an item. Please log in and try again.');
    return Promise.reject('No authentication token found');
  }
  
  return fetch('http://localhost:3000/addquestsubmit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include',
    body: JSON.stringify(formData)
  })
  .then(response => {
    if (response.status === 401) {
      // Unauthorized - redirect to login
      showAlert('error', 'Session Expired', 'Your session has expired. Please log in again.');
      setTimeout(() => {
        window.location.href = '../login/login.html';
      }, 2000);
      throw new Error('Unauthorized - session expired');
    }
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    return response.json();
  })
  .then(data => {
    if (data.success) {
      showAlert('success', 'Success', 'Item submitted successfully!');
      return data;
    } else {
      throw new Error(data.error || 'Failed to submit item');
    }
  })
  .catch(error => {
    if (!error.message.includes('Unauthorized')) {
      showAlert('error', 'Error', 'Failed to submit item. Please try again later.');
    }
    throw error;
  });
}

// Submit a new requested item (from New section)
function submitRequestedItem(formData) {
  const token = getAuthToken();
  
  if (!token) {
    showAlert('error', 'Authentication Required', 'You must be logged in to submit a request. Please log in and try again.');
    return Promise.reject('No authentication token found');
  }
  
  return fetch('http://localhost:3000/newreqsubmit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include',
    body: JSON.stringify(formData)
  })
  .then(response => {
    if (response.status === 401) {
      // Unauthorized - redirect to login
      showAlert('error', 'Session Expired', 'Your session has expired. Please log in again.');
      setTimeout(() => {
        window.location.href = '../login/login.html';
      }, 2000);
      throw new Error('Unauthorized - session expired');
    }
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    return response.json();
  })
  .then(data => {
    if (data.success) {
      showAlert('success', 'Success', 'Request submitted successfully!');
      return data;
    } else {
      throw new Error(data.error || 'Failed to submit request');
    }
  })
  .catch(error => {
    if (!error.message.includes('Unauthorized')) {
      showAlert('error', 'Error', 'Failed to submit request. Please try again later.');
    }
    throw error;
  });
}

// Compare user answers with correct answers for verification
function compareAnswers(userAnswer, correctAnswer) {
  return fetch('http://localhost:3000/api/compare-answers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userAnswer, correctAnswer })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    return response.json();
  })
  .catch(error => {
    console.error('Error comparing answers:', error);
    return { similarity: 0, isSimilar: false };
  });
}

// Utility function to show alerts (using SweetAlert2)
function showAlert(icon, title, text) {
  Swal.fire({
    icon,
    title,
    text,
    confirmButtonColor: '#3f51b5'
  });
}