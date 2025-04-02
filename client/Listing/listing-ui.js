document.addEventListener('DOMContentLoaded', (event) => {
  //gsap text welcome
  const tl = gsap.timeline();

  tl.from(".line", 1.8, {
    y: 100,
    ease: "power4.out",
    delay: 1,
    stagger: {
      amount: 0.3
    }
  });
  
  //---------------date fn---------------------------------------------
  function formatDate(date) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
 
  const date = new Date(); // Get the current date
  document.getElementById('navrighttextlink').textContent = formatDate(date);
  //----------------------------------------------------------------------------
  
  // Initialize profile link with JWT-based username fetching
  initializeProfileLink();
  
  // Initialize logout functionality
  initializeLogout();
  
});

// Function to initialize profile link with username and save KTUID
function initializeProfileLink() {
  const profileLink = document.getElementById('profilelink');
  if (!profileLink) return;
  
  // Get token from sessionStorage
  const token = sessionStorage.getItem('token');
  
  if (token) {
    // Fetch user profile data using JWT
    fetch('http://localhost:3000/api/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      return response.json();
    })
    .then(data => {
      if (data.success && data.student) {
        // Set username in profile link
        profileLink.textContent = data.student.username || 'Profile';
        
        // Save KTUID to sessionStorage for chatbot search
        sessionStorage.setItem('userKTUID', data.student.ktuid);
        
        // Also save other useful user data
        sessionStorage.setItem('userDepartment', data.student.department);
        sessionStorage.setItem('userEmail', data.student.email);
        sessionStorage.setItem('userName', data.student.username);
      } else {
        profileLink.textContent = 'Profile';
      }
    })
    .catch(error => {
      console.error('Profile fetch error:', error);
      profileLink.textContent = 'Profile';
    });
  } else {
    profileLink.textContent = 'Profile';
  }
  
}


// Function to initialize logout button with two-press confirmation
function initializeLogout() {
  const logoutLink = document.getElementById('logoutlink');
  if (!logoutLink) return;
  
  let confirmationTimer = null;
  let isConfirming = false;
  
  logoutLink.addEventListener('click', function() {
    if (!isConfirming) {
      // First click - show confirmation state
      isConfirming = true;
      logoutLink.classList.add('confirm');
      
      // Start timeout to reset after 3 seconds
      confirmationTimer = setTimeout(() => {
        resetLogoutState();
      }, 3000);
    } else {
      // Second click - perform logout
      clearTimeout(confirmationTimer);
      performLogout();
    }
  });
  
  function resetLogoutState() {
    isConfirming = false;
    logoutLink.classList.remove('confirm');
  }
  
  function performLogout() {
    // Show loading state
    Swal.fire({
      title: 'Logging out...',
      text: 'Please wait',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Get token for authorization
    const token = sessionStorage.getItem('token');
    
    // Call logout API
    fetch('http://localhost:3000/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      // Clear session data regardless of response
      sessionStorage.removeItem('token');
      
      // Show success message
      Swal.fire({
        title: 'Logged Out',
        text: 'You have been successfully logged out',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        // Redirect to login page
        window.location.href = '../login/login.html';
      });
    })
    .catch(error => {
      console.error('Logout error:', error);
      
      // Still clear session and redirect on error
      sessionStorage.removeItem('token');
      
      Swal.fire({
        title: 'Logged Out',
        text: 'You have been logged out',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        window.location.href = '../login/login.html';
      });
    });
  }
}

//---------------------------------------------------------------------------

//--------------------------------------------------------------------------
// text sliding animations

function Marquee(selector, speed) {
  const parent = document.querySelector(selector);
  const clone = parent.innerHTML;
  parent.innerHTML += clone + clone;
  let i = parent.children[0].clientWidth;

  setInterval(() => {
    const totalWidth = parent.children[0].clientWidth * 2;
    i += speed;
    if (i >= totalWidth) i = parent.children[0].clientWidth;
    parent.children[0].style.marginLeft = `-${i}px`;
  }, 0);
}


function Marquee2(selector, speed) {
  const parent = document.querySelector(selector);
  const clone = parent.innerHTML;
  parent.innerHTML += clone + clone;
  let i = parent.children[0].clientWidth;

  setInterval(() => {
    const totalWidth = parent.children[0].clientWidth * 2;
    i -= speed;
    if (i <= totalWidth / 2) i = totalWidth;
    parent.children[0].style.marginLeft = `-${i}px`;
  }, 0);
}

window.addEventListener('load', () => {
  Marquee('.marquee', .2);
  Marquee2('.marquee2', .2);
});
//----------------------------------------------------------------------
  // alert.
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
    backdrop: 'rgba(0,0,0,0.4)', // Change the backdrop color
    confirmButtonColor: '#000', // Change the confirm button color
    customClass: {
      title: 'my-alerttitle-class', // Add a custom class to the title
      content: 'my-alertcontent-class', // Add a custom class to the content
      confirmButton: 'my-alertconfirm-button-class' // Add a custom class to the confirm button
    }
  });
}
/* showAlert('error', 'Error!', 'Passwords do not match');
showAlert('success', 'Success!', 'Login successful!');
showAlert('info', 'Info', 'This is some information.');
showAlert('warning', 'Warning!', 'This is a warning.'); */
//=======================================================================