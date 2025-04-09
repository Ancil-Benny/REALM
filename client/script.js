
//----------------------------------
var cursor = document.getElementById('cursor');
var speed = 0.7; // Speed of the cursor animation
var preloader = document.getElementById('preloader');

document.addEventListener('mousemove', function(e) {
    // Use GSAP to move the cursor
    gsap.to(cursor, speed, {
        left: e.clientX - cursor.offsetWidth / 2,
        top: e.clientY - cursor.offsetHeight / 2,
        overwrite: 'auto'
    });
});

document.addEventListener('mouseover', function(e) {
    if (preloader.style.display === 'none') {
        let scaleValue;
        if (e.target.tagName == 'P' || e.target.tagName == 'SPAN') {
            scaleValue = 3;
        } else if (e.target.tagName == 'H1' || e.target.tagName == 'H2' || e.target.tagName == 'H3' || e.target.tagName == 'H4' || e.target.tagName == 'H5' || e.target.tagName == 'H6') {
            scaleValue = 5;
        } else if (e.target.tagName == 'A') {
            scaleValue = 6;
        }
        else if (e.target.classList.contains('char')) {
            scaleValue = 16;
        }
        gsap.to(cursor, speed, {scale: scaleValue});
    }
});

document.addEventListener('mouseout', function(e) {
    if (preloader.style.display === 'none') {
        gsap.to(cursor, speed, {scale: 1});
    }
});
window.onload = function() {
    var mainLogo = document.getElementById('maindivlogo'); 
    if (mainLogo) {
        mainLogo.addEventListener('mouseover', function() {
            if (preloader.style.display === 'none') {
                gsap.to(cursor, speed, {scale: 16}); 
            }
        });
        mainLogo.addEventListener('mouseout', function() {
            if (preloader.style.display === 'none') {
                gsap.to(cursor, speed, {scale: 1});
            }
        });
    }
};
//----------------------------------------------------------------------------------------
// Preloader JS
var progress = 0;
var progressElement = document.getElementById('progress');
var progressBar = document.getElementById('progressBar');
var scrollTextVisible = false;//false
var scrollTextElement = document.getElementById('scrollText');
var typingTextElement = document.getElementById('typingText');

var typingTexts = {
    25: 'OF ITEMS ARE NEVER REUNITED WITH THEIR OWNERS',
    50: 'OF STUDENTS LOSE SOMETHING ON AVERAGE A YEAR.',
    60: 'OF PEOPLE LOSE SOMETHING IN A YEAR.',
    90: 'OF WHO FIND ITEMS MAKE AN EFFORT TO RETURN THEM.',
    100: 'BRIDGING GAP BETWEEN LOST AND FOUND.'
};
var typingIndex = 0;
var typingText = '';
var typingTimeout;

function typeText() {
    if (typingIndex < typingText.length) {
        typingTextElement.classList.add('typing'); 
        typingTextElement.textContent = typingText.substring(0, typingIndex);
        typingIndex++;
        typingTimeout = setTimeout(typeText, 20); 
    } else {
        setTimeout(function() {
            if (progress < 100) {
                typingTextElement.textContent = ''; 
                progressElement.style.color = 'white'; 
            }
            typingTextElement.classList.remove('typing'); 
            if (progress < 100) {
                progress++;
                setTimeout(updateProgress, 50); 
            } else if (!scrollTextVisible) {
                scrollTextElement.innerHTML = 'SCROLL TO EXPLORE ';
                scrollTextElement.style.opacity = 1;
                scrollTextElement.style.visibility = 'visible';
                scrollTextVisible = true;
            }
        }, 800); // Increased from 500 to 800ms
    }
}

function updateProgress() {
    // Update the text percentage
    progressElement.textContent = progress + '%';
    // Update the progress bar
    progressBar.value = progress;
    progressBar.style.width = progress + '%';

    if (typingTexts[progress]) {
        progressElement.style.color = '#f3b351'; 
        typingText = typingTexts[progress];
        typingTextElement.textContent = '';
        typingIndex = 0;
        clearTimeout(typingTimeout);
        typeText();
    } else if (progress < 100) {
        progress++;
        // Increased timeout for slower animation
        setTimeout(updateProgress, 30); 
    }
}

// Check if the user has visited the page before
var isFirstVisit = sessionStorage.getItem('isFirstVisit') === null;

// If it's the first visit, show the preloader and set 'isFirstVisit' to false
if (isFirstVisit) {
    sessionStorage.setItem('isFirstVisit', 'false');
    setTimeout(updateProgress, 200); // Added delay before starting
} else {
    // If it's not the first visit, hide the preloader and show the main page immediately
  
    var mainPage = document.getElementById('mainPage');
    var circle = document.getElementById('circle');

    preloader.style.display = 'none';
    mainPage.style.display = 'block';
    mainPage.style.opacity = '1';
    circle.style.display = 'none';
}
//-----------------------------------------------------------------------

// Debounce function
function debounce(func, wait = 20, immediate = true) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

//-----------------------------text stragger maindiv logo-------------
var animationStarted = false;

window.addEventListener('wheel', debounce(function(e) {
    var preloader = document.getElementById('preloader');
    var mainPage = document.getElementById('mainPage');
    var circle = document.getElementById('circle');

    if (scrollTextVisible && !animationStarted && e.deltaY > 0) {
        animationStarted = true;

        circle.style.transform = 'translate(-50%, -50%) scale(50)';

        setTimeout(function() {
            preloader.style.display = 'none';
            mainPage.style.display = 'block';
            mainPage.style.opacity = '1';
            circle.style.display = 'none';
        
            // Start the text animation after the main page appears
            var logo = new SplitType('#maindivlogo', {types: 'chars'}); // split the text in maindivlogo into lines, words, and chars
            var p = new SplitType('#maindivp', {types: 'words'}); // split the text in maindivp into words
        
            gsap.to('#maindivlogo .char', {y: 0, stagger: 0.04, duration: 0.3}); // animate the chars in maindivlogo
            gsap.to('#maindivp .word', {y: 0, stagger: 0.04, duration: 0.5, delay: 0.2}); // animate the words in maindivp
        }, 500); // transition time of new page // transition time of new page // transition time of new page
    }
}), 20);
//-----------------------------------------------------------------------
//main page js
//date
window.addEventListener('DOMContentLoaded', (event) => {
    var logo = document.getElementById('logo');
    setInterval(function() {
        var date = new Date();
        var datePart = date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        var timePart = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        logo.innerHTML = `<span>${datePart.toUpperCase()}</span> <span style="background-color: #000; color: white; padding: 5px;">${timePart.toUpperCase()}</span>`;
    }, 1000);
});
//mouse position
window.addEventListener('DOMContentLoaded', (event) => {
    var mouseX = document.getElementById('mouseX');
    var mouseY = document.getElementById('mouseY');
    document.onmousemove = function(e) {
        var x = e.pageX;
        var y = e.pageY;
        mouseX.innerHTML = 'X:  ' + x;
        mouseY.innerHTML = 'Y:  ' + y;
    };
});
//-------------------------------------------------------------
var arrowright = document.getElementById('arrowright');
arrowright.addEventListener('click', function() {
    window.location.href = './login/login.html';
});

