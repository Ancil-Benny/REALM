window.onload = function() {
    // Load the API-related functionality
    if (typeof initLoginApi === 'function') {
        initLoginApi();
    }

    //-------------------------------------------------------------------------
    // date time
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
    // email input correction:
    // Get all input elements
    var inputs = document.querySelectorAll('.stdcontainer .form-box .input-box .field input, #signup-email');

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
    // pie for student login
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
                currentEndAngle = newEndAngle; // update the current end angle when the animation is done
            }
        }
        requestAnimationFrame(step);
    }

    //------------------------------------------------------
    // pie for student sign up
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

    //-------------------------------------------------------
    var container = document.querySelector('.stdcontainer');
    var bottomtext = document.querySelector('.bottomtext');

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
};

// Global alert function that can be used by both files
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