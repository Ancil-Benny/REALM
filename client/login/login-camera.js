// Camera module variables
let stream = null;

function initCameraModule() {
    // Set up camera handlers immediately without loading face-api models
    setupCameraHandlers();
}

function setupCameraHandlers() {
    const cameraButton = document.getElementById('camera-button');
    const cameraContainer = document.getElementById('camera-container');
    const cameraView = document.getElementById('camera-view');
    const captureButton = document.getElementById('capture-button');
    const confirmButton = document.getElementById('confirm-button');
    const retakeButton = document.getElementById('retake-button');
    const cameraCanvas = document.getElementById('camera-canvas');
    const capturedImage = document.getElementById('captured-image');
    const previewContainer = document.getElementById('preview-container');
    const imageStatus = document.getElementById('image-status');
    const closeButton = document.getElementById('close-camera');
    
    // Open camera when button is clicked
    cameraButton.addEventListener('click', openCamera);
    
    // Capture image from camera
    captureButton.addEventListener('click', captureImage);
    
    // Confirm the captured image
    confirmButton.addEventListener('click', () => {
        closeCameraView();
        
        // Show preview in the form
        previewContainer.style.display = 'block';
        imageStatus.textContent = 'Image captured';
        
        // Update camera button text
        const cameraButton = document.getElementById('camera-button');
        cameraButton.textContent = 'Change Image';
        
        // Trigger polygon update
        if (typeof window.debouncedFillQuartersSignUp === 'function') {
            window.debouncedFillQuartersSignUp();
        }
    });
    
    // Retake photo
    retakeButton.addEventListener('click', () => {
        captureButton.style.display = 'block';
        confirmButton.style.display = 'none';
        retakeButton.style.display = 'none';
        cameraView.style.display = 'block';
        cameraCanvas.style.display = 'none';
        
        // Reset image status and hidden input
        imageStatus.textContent = 'No image captured';
        document.getElementById('signup-image').value = '';
        
        // Update polygon
        if (typeof window.debouncedFillQuartersSignUp === 'function') {
            window.debouncedFillQuartersSignUp();
        }
    });
    
    // Close camera view when clicking outside or on close button
    cameraContainer.addEventListener('click', (e) => {
        if (e.target === cameraContainer) {
            closeCameraView();
        }
    });
    
    closeButton.addEventListener('click', closeCameraView);
    
    // Add ESC key to close camera
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cameraContainer.style.display === 'flex') {
            closeCameraView();
        }
    });
}

async function openCamera() {
    try {
        const cameraContainer = document.getElementById('camera-container');
        const cameraView = document.getElementById('camera-view');
        const captureButton = document.getElementById('capture-button');
        const confirmButton = document.getElementById('confirm-button');
        const retakeButton = document.getElementById('retake-button');
        const cameraCanvas = document.getElementById('camera-canvas');
        const guidance = document.getElementById('camera-guidance');
        
        // Show the camera container
        cameraContainer.style.display = 'flex';
        
        // Update guidance text
        guidance.textContent = 'Position yourself in the center and click Capture';
        
        // Camera constraints for good quality
        const constraints = {
            video: {
                facingMode: 'user', // Use front camera for selfies
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };
        
        // For mobile devices, use specific settings
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            constraints.video.facingMode = 'user'; // Ensure front camera on mobile
        }
        
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            cameraView.srcObject = stream;
            
            // Wait for video to be ready
            cameraView.onloadedmetadata = () => {
                console.log('Camera stream loaded, dimensions:', cameraView.videoWidth, 'x', cameraView.videoHeight);
                guidance.textContent = 'Position yourself in the center and click Capture';
            };
            
            // Handle video errors
            cameraView.onerror = (err) => {
                console.error('Video error:', err);
                guidance.textContent = 'Video error. Try restarting the camera.';
                showAlert('error', 'Camera Error', 'Video element encountered an error.');
            };
            
            // Enable capture button immediately
            captureButton.disabled = false;
            captureButton.style.display = 'block';
            confirmButton.style.display = 'none';
            retakeButton.style.display = 'none';
            cameraView.style.display = 'block';
            cameraCanvas.style.display = 'none';
            
        } catch (streamErr) {
            console.error('Stream error:', streamErr);
            guidance.textContent = 'Could not access camera. Check permissions.';
            showAlert('error', 'Camera Access Error', `Could not access camera: ${streamErr.message}. Make sure camera permissions are allowed in your browser.`);
        }
    } catch (err) {
        console.error("General camera setup error:", err);
        showAlert('error', 'Camera Error', 'Unable to set up the camera interface. Please check permissions or use a different browser.');
        document.getElementById('camera-container').style.display = 'none';
    }
}

function closeCameraView() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    document.getElementById('camera-container').style.display = 'none';
}

function captureImage() {
    const cameraView = document.getElementById('camera-view');
    const cameraCanvas = document.getElementById('camera-canvas');
    const captureButton = document.getElementById('capture-button');
    const confirmButton = document.getElementById('confirm-button');
    const retakeButton = document.getElementById('retake-button');
    
    // Set canvas dimensions to match the video but maintain aspect ratio
    const videoAspect = cameraView.videoWidth / cameraView.videoHeight;
    
    // Calculate maximum dimensions that will fit within constraints
    let canvasWidth, canvasHeight;
    
    // Check if we're on mobile
    if (window.innerWidth <= 768) {
        // On mobile, limit height more aggressively
        canvasHeight = Math.min(cameraView.videoHeight, window.innerHeight * 0.5);
        canvasWidth = canvasHeight * videoAspect;
    } else {
        // On desktop, use larger dimensions
        canvasHeight = Math.min(cameraView.videoHeight, window.innerHeight * 0.6);
        canvasWidth = canvasHeight * videoAspect;
    }
    
    // Set the canvas dimensions
    cameraCanvas.width = canvasWidth;
    cameraCanvas.height = canvasHeight;
    
    // Draw the current video frame on the canvas, scaling to fit
    const context = cameraCanvas.getContext('2d');
    context.drawImage(
        cameraView, 
        0, 0, cameraView.videoWidth, cameraView.videoHeight,
        0, 0, canvasWidth, canvasHeight
    );
    
    // Convert canvas to image blob
    cameraCanvas.toBlob((blob) => {
        // Create URL for preview
        const imageUrl = URL.createObjectURL(blob);
        
        // Update preview image
        const capturedImage = document.getElementById('captured-image');
        capturedImage.src = imageUrl;
        
        // Show preview container
        const previewContainer = document.getElementById('preview-container');
        previewContainer.style.display = 'block';
        
        // Update image status
        const imageStatus = document.getElementById('image-status');
        imageStatus.textContent = 'Image captured';
        
        // Pass the blob to the main API module
        window.setImageBlob(blob);
        
        // Trigger the polygon fill update
        if (typeof window.debouncedFillQuartersSignUp === 'function') {
            window.debouncedFillQuartersSignUp();
        }
        
        // Show canvas with captured image
        cameraView.style.display = 'none';
        cameraCanvas.style.display = 'block';
        
        // Hide capture button, show confirm and retake buttons
        captureButton.style.display = 'none';
        confirmButton.style.display = 'block';
        retakeButton.style.display = 'block';
        
        // Scroll to ensure buttons are visible
        confirmButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 'image/jpeg', 0.9);
}

// Expose the initialization function globally
window.initCameraModule = initCameraModule;