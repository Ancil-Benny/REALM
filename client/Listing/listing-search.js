// Updated search functionality across all sections

function initializeSearch() {
    const searchInput = document.querySelector('.search-formmain input');
    const searchButton = document.querySelector('.search-button');
    
    // Add event listener for real-time search on input
    searchInput.addEventListener('input', function() {
      performSearch(this.value);
    });
    
    // Add event listener for search button (just for show)
    searchButton.addEventListener('click', function(e) {
      e.preventDefault();
      // Just focus the input field
      searchInput.focus();
    });
  }
  
  function performSearch(searchValue) {
    searchValue = searchValue.toLowerCase().trim();
    
    // Determine which container is visible
    const visibleContainer = getVisibleContainer();
    if (!visibleContainer) return;
    
    // Different handling for different containers
    if (visibleContainer.classList.contains('listedContainer')) {
      searchListedItems(searchValue);
    } else if (visibleContainer.classList.contains('requestsContainer')) {
      searchRequestedItems(searchValue);
    } else if (visibleContainer.classList.contains('addcontainer')) {
      searchAddItems(searchValue);
    } else if (visibleContainer.classList.contains('newcontainer')) {
      searchNewItems(searchValue);
    }
  }
  
  function getVisibleContainer() {
    const containers = [
      document.querySelector('.listedContainer'),
      document.querySelector('.requestsContainer'),
      document.querySelector('.addcontainer'),
      document.querySelector('.newcontainer')
    ];
    
    return containers.find(container => 
      container && window.getComputedStyle(container).display !== 'none'
    );
  }
  
  // Search in Listed Items container
  function searchListedItems(searchValue) {
    const cards = document.querySelectorAll('.listedContainer .card__bx');
    let foundCount = 0;
    
    cards.forEach(card => {
      const cardTitle = card.querySelector('h3').textContent.toLowerCase();
      const cardCategory = card.querySelector('.categorycard').textContent.toLowerCase();
      const cardDescription = card.querySelector('p').textContent.toLowerCase();
      const detailedDesc = card.querySelector('.detailed-description')?.textContent.toLowerCase() || '';
      
      if (!searchValue || 
          cardTitle.includes(searchValue) || 
          cardCategory.includes(searchValue) || 
          cardDescription.includes(searchValue) ||
          detailedDesc.includes(searchValue)) {
        card.style.display = '';
        foundCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    updateSearchMessage('.listedContainer', foundCount, cards.length, searchValue);
  }
  
  // Search in Requested Items container
  function searchRequestedItems(searchValue) {
    const cards = document.querySelectorAll('.requestsContainer .card__bxreq');
    let foundCount = 0;
    
    cards.forEach(card => {
      const cardTitle = card.querySelector('h3').textContent.toLowerCase();
      const cardCategory = card.querySelector('.categorycardreq').textContent.toLowerCase();
      const cardDescription = card.querySelector('p').textContent.toLowerCase();
      const detailedDesc = card.querySelector('.detailed-descriptionreq')?.textContent.toLowerCase() || '';
      
      if (!searchValue || 
          cardTitle.includes(searchValue) || 
          cardCategory.includes(searchValue) || 
          cardDescription.includes(searchValue) ||
          detailedDesc.includes(searchValue)) {
        card.style.display = '';
        foundCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    updateSearchMessage('.requestsContainer', foundCount, cards.length, searchValue);
  }
  
  // Search in Add Items container
  function searchAddItems(searchValue) {
    const items = document.querySelectorAll('.addcontainer .material-list-item');
    let foundCount = 0;
    
    items.forEach(item => {
      const itemTitle = item.querySelector('.item-title').textContent.toLowerCase();
      const itemCategory = item.querySelector('.item-category').textContent.toLowerCase();
      
      if (!searchValue || 
          itemTitle.includes(searchValue) || 
          itemCategory.includes(searchValue)) {
        item.style.display = '';
        foundCount++;
      } else {
        item.style.display = 'none';
      }
    });
    
    updateSearchMessage('.addcontainer', foundCount, items.length, searchValue);
  }
  
  // Search in New Items container
  function searchNewItems(searchValue) {
    const items = document.querySelectorAll('.newcontainer .material-list-item-new');
    let foundCount = 0;
    
    items.forEach(item => {
      const itemTitle = item.querySelector('.item-title-new').textContent.toLowerCase();
      const itemCategory = item.querySelector('.item-category-new').textContent.toLowerCase();
      
      if (!searchValue || 
          itemTitle.includes(searchValue) || 
          itemCategory.includes(searchValue)) {
        item.style.display = '';
        foundCount++;
      } else {
        item.style.display = 'none';
      }
    });
    
    updateSearchMessage('.newcontainer', foundCount, items.length, searchValue);
  }
  
  // Update search message to show how many items were found
  function updateSearchMessage(containerSelector, foundCount, totalCount, searchValue) {
    // Get the container element
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    // Look for an existing search message or create a new one
    let messageElement = container.querySelector('.search-message');
    if (!messageElement) {
      messageElement = document.createElement('p');
      messageElement.className = 'search-message';
      
      // Insert at the top of the container
      container.insertBefore(messageElement, container.firstChild);
    }
    
    // Clear message when no search term
    if (!searchValue) {
      messageElement.textContent = '';
      messageElement.style.display = 'none';
      return;
    }
    
    // Show message with appropriate styling
    messageElement.style.display = 'block';
    
    if (foundCount === 0) {
      messageElement.textContent = `No matches found for "${searchValue}"`;
      messageElement.className = 'search-message no-results';
    } else {
      messageElement.textContent = `Found ${foundCount} of ${totalCount} items matching "${searchValue}"`;
      messageElement.className = 'search-message has-results';
    }
  }