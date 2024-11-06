

// CUSTOM CURSOR

document.addEventListener('DOMContentLoaded', function() {
  var cursor = document.createElement('div');
  cursor.classList.add('custom-cursor');
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', function(e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  var linkElements = document.querySelectorAll('.link, .cards-cta');
  linkElements.forEach(function(element) {
    element.addEventListener('mouseenter', function() {
      cursor.classList.add('scale-up');
    });

    element.addEventListener('mouseleave', function() {
      cursor.classList.remove('scale-up');
    });
  });
});

function updateDateTime() {
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"];
  const date = `${dayNames[now.getDay()]} - ${now.getDate()} - ${monthNames[now.getMonth()]} - ${now.getFullYear()}`;
  const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  document.getElementById('date').innerText = date;
  document.getElementById('time').innerText = time;
}

setInterval(updateDateTime, 1000);

let tl = gsap.timeline({delay: 0.2});
tl.to('div', {duration:0.5, y:0, stagger: 0.3});

window.onscroll = function() {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  document.getElementById("progress-bar").style.width = scrolled + "%";
}
//--------------------------------------------------------------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

const textElements = gsap.utils.toArray('.textblockgs');

textElements.forEach(text => {
  gsap.to(text, {
    backgroundSize: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: text,
      start: 'center 80%',
      end: 'center 20%',
      scrub: true,
    },
  });
});
//-----------------------------------------------------------------------------------------------------------
let tl4 = gsap.timeline({
  scrollTrigger: {
    trigger: '.division4',
    start: 'top center', // when the top of the trigger hits the center of the viewport
  }
});

tl4.to('.mainheader4 h1 > div', {duration:0.5, y:0, stagger: 0.3});
//-----------------------------------------------------------------------------------------------------------
//horizontal scroll
gsap.registerPlugin(ScrollTrigger);

let horizontalSection = document.querySelector('.horizontal');

console.log(horizontalSection.scrollWidth);

gsap.to('.horizontal', {
  x: () => horizontalSection.scrollWidth * -1,
  xPercent: 100,
  scrollTrigger: {
    trigger: '.horizontal',
    start: 'center center',
    end: '+=2000px',
    pin: '#horizontal-scoll',
    scrub: true,
    invalidateOnRefresh: true
  }
});
//-----------------------------------------------------------------------------------------------------------
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