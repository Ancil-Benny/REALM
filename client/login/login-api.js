// Global variables shared between files
let imageBlob = null;

function initLoginApi() {
    // Setup event listeners
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('signup-btn').addEventListener('click', handleSignup);
    
    // Initialize camera module if it exists
    if (typeof initCameraModule === 'function') {
        initCameraModule();
    } else {
        console.error('Camera module not found');
    }
}

// Update the handleLogin function

async function handleLogin() {
    // Clear any previous error message
    document.getElementById('login-message').innerHTML = '';
    
    // Get form data
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Validate form data
    if (!email || !password) {
        showAlert('error', 'Error!', 'Please fill in all fields');
        return;
    }
    
    // Show loading state
    document.getElementById('login-btn').disabled = true;
    document.getElementById('login-btn').innerHTML = 'Logging in...';
    
    try {
        // Check if we're online
        if (!navigator.onLine) {
            throw new Error('You appear to be offline. Please check your internet connection.');
        }
        
        const response = await fetch('http://localhost:3000/studentlogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Important for cookies
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Store token in sessionStorage ONLY (simpler approach)
            sessionStorage.setItem('token', data.token);
            
            // Also store user details for offline access
            if (data.student) {
                sessionStorage.setItem('userKTUID', data.student.ktuid);
                sessionStorage.setItem('userName', data.student.username);
                sessionStorage.setItem('userEmail', data.student.email);
            }
            
            // Show success message
            showAlert('success', 'Success!', 'Login successful');
            
            // Redirect to listing page
            setTimeout(() => {
                window.location.href = '../Listing/listing.html';
            }, 1500);
        } else {
            // Show error alert
            showAlert('error', 'Login Failed', data.error || 'Invalid credentials');
            
            // Also update the error message in the form
            document.getElementById('login-message').innerHTML = `<div class="error-message">${data.error || 'Invalid credentials'}</div>`;
            document.getElementById('login-btn').disabled = false;
            document.getElementById('login-btn').innerHTML = 'Login';
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // More descriptive error message
        const errorMessage = error.message || 'Unable to connect to the server. Please try again later.';
        showAlert('error', 'Connection Error', errorMessage);
        
        document.getElementById('login-message').innerHTML = `<div class="error-message">${errorMessage}</div>`;
        document.getElementById('login-btn').disabled = false;
        document.getElementById('login-btn').innerHTML = 'Login';
    }
}

async function handleSignup() {
    // Clear any previous error message
    document.getElementById('signup-message').innerHTML = '';
    
    // Get form data
    const ktuid = document.getElementById('signup-ktuid').value;
    const username = document.getElementById('signup-username').value;
    const department = document.getElementById('signup-dept').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    // Validate form data
    if (!ktuid || !username || !department || !email || !password) {
        showAlert('error', 'Error!', 'Please fill in all fields');
        return;
    }
    
    // Validate KTU ID format
    const ktuRegex = /^CEK\d{2}[A-Z]*\d{3}$/i;
    if (!ktuRegex.test(ktuid)) {
        showAlert('error', 'Error!', 'Invalid KTU ID format');
        return;
    }
    
    // Check if image is captured
    if (!imageBlob) {
        showAlert('error', 'Error!', 'Please capture an ID image');
        return;
    }
    
    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('ktuid', ktuid);
    formData.append('username', username);
    formData.append('department', department);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('idImage', imageBlob, 'id_image.jpg');
    
    // Show loading state
    document.getElementById('signup-btn').disabled = true;
    document.getElementById('signup-btn').innerHTML = 'Signing up...';
    
    try {
        const response = await fetch('http://localhost:3000/studentsignup', {
            method: 'POST',
            credentials: 'include', // Important for cookies
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store token in sessionStorage (safer than localStorage)
            sessionStorage.setItem('token', data.token);
            
            // Show success message
            showAlert('success', 'Success!', 'Registration successful');
            
            // Redirect to listing page
            setTimeout(() => {
                window.location.href = '../Listing/listing.html';
            }, 1500);
        } else {
            document.getElementById('signup-message').innerHTML = `<div class="error-message">${data.error}</div>`;
            document.getElementById('signup-btn').disabled = false;
            document.getElementById('signup-btn').innerHTML = 'Sign Up';
        }
    } catch (error) {
        console.error('Signup error:', error);
        document.getElementById('signup-message').innerHTML = `<div class="error-message">Server error. Please try again.</div>`;
        document.getElementById('signup-btn').disabled = false;
        document.getElementById('signup-btn').innerHTML = 'Sign Up';
    }
}

// Helper function to show alerts
function showAlert(icon, title, text) {
    Swal.fire({
        icon,
        title,
        text,
        confirmButtonColor: '#3085d6'
    });
}

// Export imageBlob setter for communication with camera module
window.setImageBlob = function(blob) {
    imageBlob = blob;
    
    // Update UI to show image is captured
    const previewElement = document.getElementById('id-preview');
    if (previewElement) {
        previewElement.innerHTML = '<div class="success-message">Image captured successfully</div>';
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initLoginApi);