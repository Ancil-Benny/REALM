// Main initialization and utilities

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all modules
  initializeSections();
  initializeSearch();
  loadListedItems();
  loadRequestedItems();
  loadAddItemsCategories();
  loadNewRequestCategories();
});

// Utility functions used across multiple files
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Helper function for smooth scrolling
function smoothScrollBy(dx, dy) {
  let currentY = window.scrollY;
  let targetY = currentY + dy;
  let step = dy > 0 ? 3 : -3;

  let timer = setInterval(function() {
      currentY += step;
      if ((dy > 0 && currentY > targetY) || (dy < 0 && currentY < targetY)) {
          currentY = targetY;
          clearInterval(timer);
      }
      window.scrollTo(window.scrollX, currentY);
  }, 1);
}





// Show alert function for notifications
function showAlert(type, title, message) {
  let icon;
  switch (type) {
      case 'error':
          icon = 'error';
          break;
      case 'success':
          icon = 'success';
          break;
      case 'info':
          icon = 'info';
          break;
      case 'warning':
          icon = 'warning';
          break;
      default:
          icon = 'info';
  }

  Swal.fire({
      title: title,
      text: message,
      icon: icon,
      confirmButtonText: 'OK',
      backdrop: 'rgba(0,0,0,0.4)',
      confirmButtonColor: '#000',
      customClass: {
          title: 'my-alerttitle-class',
          content: 'my-alertcontent-class',
          confirmButton: 'my-alertconfirm-button-class'
      }
  });
}