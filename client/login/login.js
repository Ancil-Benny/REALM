window.onload = function() {
    //-------------------------------------------------------------------------
//date time
    setInterval(function() {
        var date = new Date();
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var dateNum = date.getDate();
        var month = monthNames[date.getMonth()];
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        document.getElementById('time-date').innerHTML = dateNum + " " + month + " " + hours + ":" + minutes + " " + ampm;
    }, 1000);
//--------------------------------------------------------------------------
// cursor
    const cursorSmall = document.querySelector('.cursor--small');

    document.addEventListener('mousemove', (e) => {
      cursorSmall.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`;
    });

//--------------------------------------------------------------------------
//email input correction:
// Get all input elements
var inputs = document.querySelectorAll
('.stdcontainer .form-box .input-box .field input, #signup-email, #admlogin-email, #admsignup-email,#faclogin-email, #facsignup-email');


// Loop through the inputs
for (var i = 0; i < inputs.length; i++) {
    // Add event listener for input event
    inputs[i].addEventListener('input', function() {
        // Check if input is not empty
        if (this.value != '') {
            // Add not-empty class
            this.classList.add('not-empty');
        } else {
            // Remove not-empty class
            this.classList.remove('not-empty');
        }
    });
}
//---------------------------------------------------------------------------
//pie for student login
var debounceTimer;
var currentEndAngle = 0; // keep track of the current end angle

// Debounce function to prevent excessive function calls
window.debouncedFillQuarters = function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fillQuarters, 250);
  }

// Function to convert polar coordinates to Cartesian
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

// Function to describe an arc using Cartesian coordinates
function describeArc(x, y, radius, startAngle, endAngle){
    var points = [`${x},${y}`]; // Start at the center

    // Generate points on the arc
    for (var i = startAngle; i <= endAngle; i++) {
        var point = polarToCartesian(x, y, radius, i);
        points.push(`${point.x},${point.y}`);
    }

    points.push(`${x},${y}`); // End at the center

    return points.join(" ");
}

// Function to fill quarters based on input fields
function fillQuarters() {
  var form = document.getElementById('myForm');
  var inputs = form.getElementsByTagName('input');
  var totalQuarters = inputs.length; // total number of fields
  var quartersToFill = 0; // number of filled fields

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].value) {
      quartersToFill++;
    }
  }

  var svg = document.getElementById('circleSVG');
  var newEndAngle = (quartersToFill / totalQuarters) * 360;

  // Clear previous polygons
  while (svg.lastChild.nodeName == 'polygon') {
    svg.removeChild(svg.lastChild);
  }

  // Use a polygon instead of a path
  var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", describeArc(50, 50, 1, 0, currentEndAngle)); // start from the current end angle
  polygon.setAttribute("fill", "#f3b351");
  svg.appendChild(polygon);

  // Animate the points of the polygon
  var duration = 300; // duration of the animation in milliseconds
  var start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = timestamp - start;
    var angle = currentEndAngle + progress / duration * (newEndAngle - currentEndAngle);
    polygon.setAttribute("points", describeArc(50, 50, 40, 0, angle));
    if (progress < duration) {
      requestAnimationFrame(step);
    } else {
      currentEndAngle = newEndAngle; // update the current end angle when t

      
    }
  }
  requestAnimationFrame(step);
}
//------------------------------------------------------
//pie for student sign up
// Debounce function for sign-up form
var debounceTimerSignUp;
var currentEndAngleSignUp = 0; // keep track of the current end angle for sign-up form

window.debouncedFillQuartersSignUp = function() {
    clearTimeout(debounceTimerSignUp);
    debounceTimerSignUp = setTimeout(fillQuartersSignUp, 250);
}

// Function to fill quarters based on sign-up form inputs
function fillQuartersSignUp() {
  var form = document.getElementById('signUpForm');
  var inputs = form.getElementsByTagName('input');
  var totalQuarters = inputs.length; // total number of fields
  var quartersToFill = 0; // number of filled fields

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].value) {
      quartersToFill++;
    }
  }

  var svg = document.getElementById('circleSVGSignUp');
  var newEndAngle = (quartersToFill / totalQuarters) * 360;

  // Clear previous polygons
  while (svg.lastChild.nodeName == 'polygon') {
    svg.removeChild(svg.lastChild);
  }

  // Use a polygon instead of a path
  var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", describeArc(50, 50, 1, 0, currentEndAngleSignUp)); // start from the current end angle
  polygon.setAttribute("fill", "#f3b351");
  svg.appendChild(polygon);

  // Animate the points of the polygon
  var duration = 300; // duration of the animation in milliseconds
  var start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = timestamp - start;
    var angle = currentEndAngleSignUp + progress / duration * (newEndAngle - currentEndAngleSignUp);
    polygon.setAttribute("points", describeArc(50, 50, 40, 0, angle));
    if (progress < duration) {
      requestAnimationFrame(step);
    } else {
      currentEndAngleSignUp = newEndAngle; // update the current end angle when the animation is done
    }
  }
  requestAnimationFrame(step);
}

// Add the oninput attribute to the sign-up form inputs
var signUpInputs = document.getElementById('signUpForm').getElementsByTagName('input');
for (var i = 0; i < signUpInputs.length; i++) {
  signUpInputs[i].setAttribute('oninput', 'debouncedFillQuartersSignUp()');
}

//------------------------------------------------------
//pie for admin sign in

var debounceTimeradmsi;
var currentEndAngleadmsi = 0; // keep track of the current end angle for sign-up form

window.debouncedFillQuartersadmsi = function() {
    clearTimeout(debounceTimeradmsi);
    debounceTimeradmsi = setTimeout(fillQuartersadmsi, 250);
}

// Function to fill quarters based on sign-up form inputs
function fillQuartersadmsi() {
  var form = document.getElementById('myadmForm');
  var inputs = form.getElementsByTagName('input');
  var totalQuarters = inputs.length; // total number of fields
  var quartersToFill = 0; // number of filled fields

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].value) {
      quartersToFill++;
    }
  }

  var svg = document.getElementById('circleSVGadmsi');
  var newEndAngle = (quartersToFill / totalQuarters) * 360;

  // Clear previous polygons
  while (svg.lastChild.nodeName == 'polygon') {
    svg.removeChild(svg.lastChild);
  }

  // Use a polygon instead of a path
  var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", describeArc(50, 50, 1, 0, currentEndAngleadmsi)); // start from the current end angle
  polygon.setAttribute("fill", "#f3b351");
  svg.appendChild(polygon);

  // Animate the points of the polygon
  var duration = 300; // duration of the animation in milliseconds
  var start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = timestamp - start;
    var angle = currentEndAngleadmsi + progress / duration * (newEndAngle - currentEndAngleadmsi);
    polygon.setAttribute("points", describeArc(50, 50, 40, 0, angle));
    if (progress < duration) {
      requestAnimationFrame(step);
    } else {
      currentEndAngleadmsi = newEndAngle; // update the current end angle when the animation is done
    }
  }
  requestAnimationFrame(step);
}

// Add the oninput attribute to the sign-up form inputs
var Inputs = document.getElementById('myadmForm').getElementsByTagName('input');
for (var i = 0; i < Inputs.length; i++) {
  Inputs[i].setAttribute('oninput', 'debouncedFillQuartersadmsi()');
}
//------------------------------------------------------
//pie for admin sign up

var debounceTimeradmsu;
var currentEndAngleadmsu = 0; // keep track of the current end angle for sign-up form

window.debouncedFillQuartersadmsu = function() {
    clearTimeout(debounceTimeradmsu);
    debounceTimeradmsu = setTimeout(fillQuartersadmsu, 250);
}

// Function to fill quarters based on sign-up form inputs
function fillQuartersadmsu() {
  var form = document.getElementById('admsignUpForm');
  var inputs = form.getElementsByTagName('input');
  var totalQuarters = inputs.length; // total number of fields
  var quartersToFill = 0; // number of filled fields

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].value) {
      quartersToFill++;
    }
  }

  var svg = document.getElementById('circleSVGadmsu');
  var newEndAngle = (quartersToFill / totalQuarters) * 360;

  // Clear previous polygons
  while (svg.lastChild.nodeName == 'polygon') {
    svg.removeChild(svg.lastChild);
  }

  // Use a polygon instead of a path
  var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", describeArc(50, 50, 1, 0, currentEndAngleadmsi)); // start from the current end angle
  polygon.setAttribute("fill", "#f3b351");
  svg.appendChild(polygon);

  // Animate the points of the polygon
  var duration = 300; // duration of the animation in milliseconds
  var start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = timestamp - start;
    var angle = currentEndAngleadmsu + progress / duration * (newEndAngle - currentEndAngleadmsu);
    polygon.setAttribute("points", describeArc(50, 50, 40, 0, angle));
    if (progress < duration) {
      requestAnimationFrame(step);
    } else {
      currentEndAngleadmsu = newEndAngle; // update the current end angle when the animation is done
    }
  }
  requestAnimationFrame(step);
}

// Add the oninput attribute to the sign-up form inputs
var Inputs = document.getElementById('admsignUpForm').getElementsByTagName('input');
for (var i = 0; i < Inputs.length; i++) {
  Inputs[i].setAttribute('oninput', 'debouncedFillQuartersadmsu()');
}

//-------------------------------------------------------
//pie for faculty sign in

var debounceTimerfacsi;
var currentEndAnglefacsi = 0; // keep track of the current end angle for sign-up form

window.debouncedFillQuartersfacsi = function() {
    clearTimeout(debounceTimerfacsi);
    debounceTimerfacsi = setTimeout(fillQuartersfacsi, 250);
}

// Function to fill quarters based on sign-up form inputs
function fillQuartersfacsi() {
  var form = document.getElementById('myfacForm');
  var inputs = form.getElementsByTagName('input');
  var totalQuarters = inputs.length; // total number of fields
  var quartersToFill = 0; // number of filled fields

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].value) {
      quartersToFill++;
    }
  }

  var svg = document.getElementById('circleSVGfacsi');
  var newEndAngle = (quartersToFill / totalQuarters) * 360;

  // Clear previous polygons
  while (svg.lastChild.nodeName == 'polygon') {
    svg.removeChild(svg.lastChild);
  }

  // Use a polygon instead of a path
  var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", describeArc(50, 50, 1, 0, currentEndAnglefacsi)); // start from the current end angle
  polygon.setAttribute("fill", "#f3b351");
  svg.appendChild(polygon);

  // Animate the points of the polygon
  var duration = 300; // duration of the animation in milliseconds
  var start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = timestamp - start;
    var angle = currentEndAnglefacsi + progress / duration * (newEndAngle - currentEndAnglefacsi);
    polygon.setAttribute("points", describeArc(50, 50, 40, 0, angle));
    if (progress < duration) {
      requestAnimationFrame(step);
    } else {
      currentEndAnglefacsi = newEndAngle; // update the current end angle when the animation is done
    }
  }
  requestAnimationFrame(step);
}

// Add the oninput attribute to the sign-up form inputs
var Inputs = document.getElementById('myfacForm').getElementsByTagName('input');
for (var i = 0; i < Inputs.length; i++) {
  Inputs[i].setAttribute('oninput', 'debouncedFillQuartersfacsi()');
}
//------------------------------------------------------
//pie for faculty sign up

var debounceTimerfacsu;
var currentEndAnglefacsu = 0; // keep track of the current end angle for sign-up form

window.debouncedFillQuartersfacsu = function() {
    clearTimeout(debounceTimerfacsu);
    debounceTimerfacsu = setTimeout(fillQuartersfacsu, 250);
}

// Function to fill quarters based on sign-up form inputs
function fillQuartersfacsu() {
  var form = document.getElementById('facsignUpForm');
  var inputs = form.getElementsByTagName('input');
  var totalQuarters = inputs.length; // total number of fields
  var quartersToFill = 0; // number of filled fields

  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].value) {
      quartersToFill++;
    }
  }

  var svg = document.getElementById('circleSVGfacsu');
  var newEndAngle = (quartersToFill / totalQuarters) * 360;

  // Clear previous polygons
  while (svg.lastChild.nodeName == 'polygon') {
    svg.removeChild(svg.lastChild);
  }

  // Use a polygon instead of a path
  var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.setAttribute("points", describeArc(50, 50, 1, 0, currentEndAnglefacsi)); // start from the current end angle
  polygon.setAttribute("fill", "#f3b351");
  svg.appendChild(polygon);

  // Animate the points of the polygon
  var duration = 300; // duration of the animation in milliseconds
  var start = null;
  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = timestamp - start;
    var angle = currentEndAnglefacsu + progress / duration * (newEndAngle - currentEndAnglefacsu);
    polygon.setAttribute("points", describeArc(50, 50, 40, 0, angle));
    if (progress < duration) {
      requestAnimationFrame(step);
    } else {
      currentEndAnglefacsu = newEndAngle; // update the current end angle when the animation is done
    }
  }
  requestAnimationFrame(step);
}

// Add the oninput attribute to the sign-up form inputs
var Inputs = document.getElementById('facsignUpForm').getElementsByTagName('input');
for (var i = 0; i < Inputs.length; i++) {
  Inputs[i].setAttribute('oninput', 'debouncedFillQuartersfacsu()');
}

//-------------------------------------------------------
var container = document.querySelector('.stdcontainer');
var admincontainer = document.querySelector('.admincontainer');
var faccontainer = document.querySelector('.faccontainer');
var bottomtext = document.querySelector('.bottomtext');
//-------------------------------------------------------
//stdcontainer
document.getElementById('stdconshow').addEventListener('click', function() {
  bottomtext.style.display='none';
  admincontainer.style.display='none';
  faccontainer.style.display='none';//faccontainer
    container.style.display='flex';
    container.scrollIntoView({behavior: "smooth"});
});
//-------------------------
//admcontainer
document.getElementById('admconshow').addEventListener('click', function() {
  bottomtext.style.display='none';
  container.style.display='none';//stdcontainer
  faccontainer.style.display='none';//faccontainer
  admincontainer.style.display='flex';
  admincontainer.scrollIntoView({behavior: "smooth"});
});
//-------------------------------------------------------
//faccontainer
document.getElementById('facconshow').addEventListener('click', function() {
  bottomtext.style.display='none';
  container.style.display='none';//stdcontainer
  admincontainer.style.display='none';//admincontainer
  faccontainer.style.display='flex';
  faccontainer.scrollIntoView({behavior: "smooth"});
});
//-------------------------------------------------------
document.querySelector('.register-link').addEventListener('click', function(event) {
  event.preventDefault();
  document.querySelector('.stdcontainer .login').style.display = 'none';
  document.querySelector('.stdcontainer .stdsu').style.display = 'flex';
});

document.querySelector('.login-link').addEventListener('click', function(event) {
  event.preventDefault();
  document.querySelector('.stdcontainer .stdsu').style.display = 'none';
  document.querySelector('.stdcontainer .login').style.display = 'flex';
});
//------------------------------------------------------
document.querySelector('.admregister-link').addEventListener('click', function(event) {
  event.preventDefault();
  document.querySelector('.admincontainer .admlogin').style.display = 'none';
  document.querySelector('.admincontainer .admsu').style.display = 'flex';
});

document.querySelector('.admlogin-link').addEventListener('click', function(event) {
  event.preventDefault();
  document.querySelector('.admincontainer .admsu').style.display = 'none';
  document.querySelector('.admincontainer .admlogin').style.display = 'flex';
});
//------------------------------------------------------
document.querySelector('.facregister-link').addEventListener('click', function(event) {
  event.preventDefault();
  document.querySelector('.faccontainer .faclogin').style.display = 'none';
  document.querySelector('.faccontainer .facsu').style.display = 'flex';
});

document.querySelector('.faclogin-link').addEventListener('click', function(event) {
  event.preventDefault();
  document.querySelector('.faccontainer .facsu').style.display = 'none';
  document.querySelector('.faccontainer .faclogin').style.display = 'flex';
});
//------------------------------------------------------
//img upload label for the student signup front end code only
document.getElementById('signup-image').addEventListener('change', function(e) {
  if (e.target.files.length > 0) {
      var fileName = e.target.files[0].name;
      var label = document.getElementById('image-label');
      if (label) {
          label.textContent = fileName;
      }
  }
});
//--------------------------------------------------
//student sign up
document.getElementById('signup-btn').addEventListener('click', async () => {
  // Get form data
  let ktuid = document.getElementById('signup-ktuid').value.trim();
  let username = document.getElementById('signup-username').value.trim();
  let department = document.getElementById('signup-dept').value.trim();
  let emailInput = document.getElementById('signup-email');
  let password = document.getElementById('signup-password').value;
  let confirmPassword = document.getElementById('signup-confirm-password').value;
  let idImage = document.getElementById('signup-image').files[0];


  // Check if ID matches required format
  if (!/^cek\d{2}[a-zA-Z]*\d{3}$/i.test(ktuid)) {
    showAlert('error', 'Error!', 'Invalid KTU ID format');
    return;
  }
  ktuid = ktuid.toUpperCase();

 
let email = emailInput.value;

 // Check if email is valid
  if (!emailInput.checkValidity()) {
    showAlert('error', 'Error!', 'Invalid email address');
    return;
  }

  // Check if password is at least 4 characters long
  if (password.length < 4) {
    showAlert('error', 'Error!', 'Password must be at least 4 characters long');
    return;
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    showAlert('error', 'Error!','Passwords do not match');
    return;
  }

  // Check if all fields are filled
  if (!ktuid || !username || !department || !email || !password || !confirmPassword || !idImage) {
    showAlert('error', 'Error!','All fields are required');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('ktuid', ktuid);
    formData.append('username', username);
    formData.append('department', department);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('idImage', idImage);

    const response = await fetch('http://localhost:3000/studentsignup', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Network response not ok: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      showAlert('success', 'Success!', 'Sign Up successful!');
      // ... other code to handle successful signup (e.g., redirect)
    } else {
      alert('Signup failed: ' + data.error);
      return;
    }
  } catch (error) {
    alert('An error occurred: ' + error.message);
  }
});
//------------------------------------------------------
document.getElementById('login-btn').addEventListener('click', async () => {
  // Get form data
  let email = document.getElementById('login-email').value;
  let password = document.getElementById('login-password').value;

  try {
    const response = await fetch('http://localhost:3000/studentlogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Network response not ok: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('ruserId', data.userId);
      localStorage.setItem('rusertype', 'student');
      showAlert('success', 'Success!', 'Login successful!');
      window.location.href = "../profile/student/student.html";
    } else {
      if (data.error === 'Verification still undergoing. Please wait.') {
        showAlert('warning', 'Warning!', data.error);
      } else {
        showAlert('error', 'Error!', 'Login failed!');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('error', 'Error!', 'An error occurred: ' + error.message);
  }
});
//--------------------------------------------------
//admin sign up
document.getElementById('admsignup-btn').addEventListener('click', async () => {
  try {
    // Get form data
    let admid = document.getElementById('admsignup-id').value.trim();
    let admname = document.getElementById('admsignup-name').value.trim();
    let admemailInput = document.getElementById('admsignup-email');
    let admpassword = document.getElementById('admsignup-password').value;
    let admconfirmPassword = document.getElementById('admsignup-confirm-password').value;

    // Check if ID matches required format 5xxxx
    if (!/^5\d{4}$/i.test(admid)) {
      showAlert('error', 'Error!', 'Invalid ID format');
      return;
    }

    let admemail = admemailInput.value;

    // Check if email is valid
    if (!admemailInput.checkValidity()) {
      showAlert('error', 'Error!', 'Invalid email address');
      return;
    }

    // Check if password is at least 4 characters long
    if (admpassword.length < 4) {
      showAlert('error', 'Error!', 'Password must be at least 4 characters long');
      return;
    }

    // Check if passwords match
    if (admpassword !== admconfirmPassword) {
      showAlert('error', 'Error!', 'Passwords do not match');
      return;
    }

    // Check if all fields are filled
    if (!admid || !admname || !admemail || !admpassword || !admconfirmPassword) {
      showAlert('error', 'Error!', 'All fields are required');
      return;
    }

    const response = await fetch('http://localhost:3000/adminsignup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        admid: admid,
        admname: admname,
        admemail: admemail,
        admpassword: admpassword
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Network response not ok: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      showAlert('success', 'Success!', 'Sign Up successful!');
      // ... other code to handle successful signup (e.g., redirect)
    } else {
      alert('Signup failed: ' + data.error);
      return;
    }
  } catch (error) {
    alert('An error occurred: ' + error.message);
  }
});
//------------------------------------------------------
//admin login
document.getElementById('admlogin-btn').addEventListener('click', async () => {
  // Get form data
  let admemail = document.getElementById('admlogin-email').value;
  let admpassword = document.getElementById('admlogin-password').value;

  try {
    const response = await fetch('http://localhost:3000/adminlogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ admemail, admpassword }),
    });

    if (!response.ok) {
      throw new Error(`Network response not ok: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('ruserId', data.adminId);
      localStorage.setItem('rusertype', 'admin');
      showAlert('success', 'Success!', 'Login successful!');
      window.location.href = "../profile/admin/adminprofile.html";
      
    } else {
      showAlert('error', 'Error!', 'Login failed!');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('error', 'Error!', 'An error occurred: ' + error.message);
  }
});
//----------------------------------------------------
//faculty sign up
document.getElementById('facsignup-btn').addEventListener('click', async () => {
  try {
    // Get form data
    let facid = document.getElementById('facsignup-id').value.trim();
    let facusername = document.getElementById('facsignup-name').value.trim();
    let facemailInput = document.getElementById('facsignup-email');
    let facpassword = document.getElementById('facsignup-password').value;
    let facconfirmPassword = document.getElementById('facsignup-confirm-password').value;

    // Check if ID matches required format 8xxxx
    if (!/^8\d{4}$/i.test(facid)) {
      showAlert('error', 'Error!', 'Invalid ID format');
      return;
    }

    let facemail = facemailInput.value;

    // Check if email is valid
    if (!facemailInput.checkValidity()) {
      showAlert('error', 'Error!', 'Invalid email address');
      return;
    }

    // Check if password is at least 4 characters long
    if (facpassword.length < 4) {
      showAlert('error', 'Error!', 'Password must be at least 4 characters long');
      return;
    }

    // Check if passwords match
    if (facpassword !== facconfirmPassword) {
      showAlert('error', 'Error!', 'Passwords do not match');
      return;
    }

    // Check if all fields are filled
    if (!facid || !facusername || !facemail || !facpassword || !facconfirmPassword) {
      showAlert('error', 'Error!', 'All fields are required');
      return;
    }

    const response = await fetch('http://localhost:3000/facultysignup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        facid: facid,
        username: facusername,
        email: facemail,
        password: facpassword
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Network response not ok: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      showAlert('success', 'Success!', 'Sign Up successful!');
      // ... other code to handle successful signup (e.g., redirect)
    } else {
      alert('Signup failed: ' + data.error);
      return;
    }
  } catch (error) {
    alert('An error occurred: ' + error.message);
  }
});
//------------------------------------------------------
//faculty login
document.getElementById('faclogin-btn').addEventListener('click', async () => {
  // Get form data
  let email = document.getElementById('faclogin-email').value;
  let password = document.getElementById('faclogin-password').value;

  try {
    const response = await fetch('http://localhost:3000/facultylogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Network response not ok: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('ruserId', data.facultyId);
      localStorage.setItem('rusertype', 'faculty');
      showAlert('success', 'Success!', 'Login successful!');
      window.location.href = "../profile/faculty/facultyprofile.html";
      
    } else {
      showAlert('error', 'Error!', 'Login failed!');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('error', 'Error!', 'An error occurred: ' + error.message);
  }
});
//----------------------------------------------------
//---------------------------------------------------------------
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
}