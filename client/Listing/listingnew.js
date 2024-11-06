document.addEventListener('DOMContentLoaded', (event) => {

  //one.
  //---------------date fn---------------------------------------------
    function formatDate(date) {
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
   
    const date = new Date(); // Get the current date
    document.getElementById('navrighttextlink').textContent = formatDate(date);
   //---------------------------------------------------------------------------
   window.addEventListener('scroll', function() {
    var arrowContainer = document.querySelector('.arrow-container');
    if (window.scrollY > 500) { 
      arrowContainer.classList.remove('arrow-hidden');
    } else {
      arrowContainer.classList.add('arrow-hidden');
    }
  });
  
  var arrowContainer = document.querySelector('.arrow-container');
  arrowContainer.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
   //---------------------------------------------------------------------
  
    //two.
   // target conmtainer smooth scroll
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
    }, );
  }
  //---------------------------------------------------------------------------
  //three.
    //initial containers showing
    var listedlink = document.getElementById('listedlink');
    var requestedlink = document.getElementById('requestedlink');
    var addlink = document.getElementById('listedaddlink');
    var newlink = document.getElementById('requestnewlink');
    
    var listedContainer = document.querySelector('.listedContainer');
    var requestsContainer = document.querySelector('.requestsContainer');
    var addcontainer = document.querySelector('.addcontainer');
    var newcontainer = document.querySelector('.newcontainer');
    var questionContainer = document.querySelector('.questioncontainer');
    var questionContainernew = document.querySelector('.questioncontainernew');
    
    //---------------------------------------------------------------------------
    //four.
  //profile link redirect to profile:
    var profilelink = document.getElementById('profilelink');
    profilelink.addEventListener('click', function(event) {
      var userType = localStorage.getItem('rusertype');
      
      if(userType === 'student') {
        window.location.href = "../profile/student/student.html";
      } else if(userType === 'faculty') {
        window.location.href = "../profile/faculty/facultyprofile.html";
      } else if(userType === 'admin') {
        window.location.href = "../profile/admin/adminprofile.html";
      }
    });
   
    //--------------------------------------------------------------------------
    //five.
    //listed container
    listedlink.addEventListener('click', function(event) {
    
     
      addcontainer.style.display = 'none';
      newcontainer.style.display = 'none';
      requestsContainer.style.display = 'none'; 
      questionContainer.style.display = 'none';
      questionContainernew.style.display = 'none';
      listedContainer.style.display = 'block'; 
  
      // Scroll to the listedContainer
      listedContainer.scrollIntoView({behavior: "smooth"});
  
      setTimeout(function() {
        smoothScrollBy(0, -350);
    }, 900); // Adjust delay as needed
    });
  
       //---------------------------card creation-----------------------------------
     //six.
       //card creation along with verification container
       function createCard(data) {
        var cardBx = document.createElement('div');
        cardBx.className = 'card__bx';
      
        var cardData = document.createElement('div');
        cardData.className = 'card__data';
        cardBx.appendChild(cardData);
      
          var cardIcon = document.createElement('div');
        cardIcon.className = 'card__icon';
        var icon = document.createElement('i');
        icon.className = 'material-icons card__icon';
        icon.textContent = data.iconName; 
        cardIcon.appendChild(icon);
        cardData.appendChild(cardIcon);
  
  
        var cardContent = document.createElement('div');
        cardContent.className = 'card__content';
        cardData.appendChild(cardContent);
      
        var title = document.createElement('h3');
        title.textContent = data.title; 
        cardContent.appendChild(title);
      
        var category = document.createElement('div');
        category.className = 'categorycard';
        category.textContent = data.category; 
        cardContent.appendChild(category);
      
        var description = document.createElement('p');
        description.textContent = data.description; 
        cardContent.appendChild(description);
      
        var detailedDescription = document.createElement('p');
        detailedDescription.className = 'detailed-description';
        detailedDescription.textContent = data.detailedDescription; 
        cardContent.appendChild(detailedDescription);
  
        var verificationContainer = createVerificationContainer(data,data.item);
        cardBx.appendChild(verificationContainer);
      
        var link = document.createElement('a');
        link.href = '#';
        //--------------------------------------
        if (data.userMatch) {
          link.style.display = 'none'; // Hide the button if userMatch is true
        } else if (data.itemId) {
          if (data.status === 'pending') {
            link.textContent = 'Pending';
          } else if (data.status === 'fail' && data.chances === 2) {
            link.textContent = 'Raise Ticket';
          } else {
            link.textContent = 'Claim';
          }
        } else {
          link.textContent = 'Claim';
        }

        //------------------------------------------------
        link.addEventListener('click', function(event) {
          event.preventDefault();
          if (link.textContent === 'Claim') {
            verificationContainer.style.display = 'block';
          }
        });//verification container trigger
        cardContent.appendChild(link);
        
      
        return cardBx;
      }//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
      var container = document.querySelector('.listedContainer .container');
  
  
    //(3)fetch card data from server listeditems db
//global variable to store answer of verification questions
var verificationAnswers = {};
var usersType = localStorage.getItem('rusertype');
var usersId = localStorage.getItem('ruserId');

fetch(`http://localhost:3000/api/listeditems?userId=${usersId}&usertype=${usersType}`)
.then(response => response.json())
.then(data => {
  console.log(data); 
  // Loop through the data and create a card for each item
   data.forEach(item => {
    //verification answers to compare
    // Store the answers in the global object
    verificationAnswers[item.itemId] = item.verificationQuest.map(q => q.answer);
    let midpoint = Math.floor(item.questions.length / 2);
    // If the number of questions is odd, add one to the midpoint
    if (item.questions.length % 2 !== 0) {
      midpoint++;
    }
    // Divide the questions array into two parts
    const firstHalf = item.questions.slice(0, midpoint).map(q => q.answer).join(' ');
    const secondHalf = item.questions.slice(midpoint).map(q => q.answer).join(', ');

    // Pass only the questions to the createCard function
    var vquestions = item.verificationQuest.map(q => q.question);


    var card = createCard({
      title: item.title,
      iconName: item.iconName,
      category: item.category,
      description: firstHalf,
      detailedDescription: secondHalf,
      verificationQuest: vquestions,
      userMatch: item.userMatch, 
      itemId: item.itemId, 
      chances: item.chances,
      status: item.status,
      item: item
    });

    container.appendChild(card);
  });
})
.catch(error => console.error('Error:', error));
 //--------------------------------------------------------------------------
  //verification container
  
  // Helper function to create an element with a specific type and class
  function createElementWithClass(type, className) {
    const element = document.createElement(type);
    element.className = className;
    return element;
  }
  // Helper function to create an element with a specific type and text
  function createElementWithText(type, text) {
    const element = document.createElement(type);
    element.textContent = text;
    return element;
  }
  // Helper function to create a button with a specific text and click event listener
  function createButtonWithTextAndListener(text, listener) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', listener);
    return button;
  }
  // Main function to create the verification container
  function createVerificationContainer(data, item) {
    // Create the outer verification container
    const verificationContainer = createElementWithClass('div', 'verification-container');
    verificationContainer.style.display = 'none'; // Initially hidden
  
    // Create the inner container
    const innerverbox = createElementWithClass('div', 'innerverbox');
    verificationContainer.appendChild(innerverbox);
  
    // Create the first inner box that appears when clicking claim
    const innerverbox2 = createElementWithClass('div', 'innerverbox2');
    innerverbox.appendChild(innerverbox2);
  
    // Create the heading and content for the first inner box
    const innerverboxheading = createElementWithText('h1', 'Making the claim');
    innerverbox2.appendChild(innerverboxheading);
    const innerverboxcontent = createElementWithText('p', 'You need to undergo verification to claim this item. If you understand click next to proceed');
    innerverbox2.appendChild(innerverboxcontent);
  
    // Create the second inner container
    const innerContainer = createElementWithClass('div', 'inner-container');
    innerverbox.appendChild(innerContainer);
    innerContainer.style.display = 'none'; // Initially hidden
  
    // Create the close button for the first inner box
    const innervercloseButton = createButtonWithTextAndListener('Close', () => {
      innerContainer.style.display = 'none';
      verificationContainer.style.display = 'none';
    });
    innerverbox2.appendChild(innervercloseButton);
  
    // Create the next button for the first inner box
    const innervernextButton = createButtonWithTextAndListener('Next', () => {
      innerverbox2.style.display = 'none';
      innerContainer.style.display = 'block';
      innerContainer.style.opacity = 0; // Start with opacity 0 for fade-in effect
      setTimeout(() => innerContainer.style.opacity = 1, 50); // Fade in
    });
    innerverbox2.appendChild(innervernextButton);
  
    // Create the heading for the second inner container
    const heading = createElementWithText('h1', 'Answer the questions below');
    innerContainer.appendChild(heading);

    let form;
    if (data && data.verificationQuest) {
      form = document.createElement('form');
      data.verificationQuest.forEach((question, index) => {
        const questionForm = document.createElement('div');
        questionForm.innerHTML = `
          <label for="question${index}">${question}</label>
          <input type="text" id="question${index}" name="question${index}">
        `;
        form.appendChild(questionForm);
      });
      
    }
  
  
  //-----------------------------------------------------------------
  //==============verification stage compare========================
  let chances=0; //for storing chance count used in verification stage
  let status='begin';
// Create the 'Next' button with an event listener
const nextButton = createButtonWithTextAndListener('Next', (event) => {
  // Prevent the default form submission event
  event.preventDefault();

  // Handle the 'Next' button click
  const correctAnswers = verificationAnswers[data.item.itemId];
  console.log(correctAnswers);

  // Access the input values here, after the user has clicked the 'Next' button
  data.verificationQuest.forEach((question, index) => {
    const userAnswer = form.elements[`question${index}`].value;
    console.log(userAnswer);
    const correctAnswer = correctAnswers[index];
    const itemId = data.item.itemId;
    data.userId = localStorage.getItem('ruserId');
    data.usertype = localStorage.getItem('rusertype');
    const dateTime = new Date().toISOString();
  
    fetch('http://localhost:3000/api/compare-answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userAnswer, correctAnswer }),
    })
      .then(response => response.json())
      .then(responseData => {
        const { similarity, isSimilar } = responseData; //renamed data itself, to avoid
        const similarityPercentage = similarity * 100;
        console.log('Similarity:', similarity);
        if (!isSimilar) {
          console.log(`Answer to question ${index + 1} is incorrect.`);
          form.reset();
          innerverbox2.style.display = 'block';
          innerContainer.style.display = 'none';
          verificationContainer.style.display = 'none';
          alert("claim cannot be done");     
          chances++;
          status='fail';

          //stores data to claim collection after rejection
          fetch('http://localhost:3000/api/store-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({  userId: data.userId, usertype: data.usertype, itemId, chances, dateTime, similarityPercentage, status,question, userAnswer, correctAnswer  }),
          })
            .then(response => response.json())
            .then(storeDataResponse => console.log(storeDataResponse))
            .catch(error => console.error('Error:', error));
        } else {
          console.log(`Answer to question ${index + 1} is correct.`);
          form.reset();
          innerverbox2.style.display = 'block';
          innerContainer.style.display = 'none';
          verificationContainer.style.display = 'none';
          alert("Verification initial stage completed, please wait for final approval");
          status = 'pending';

           //stores data to claim collection after initial verification if success
  fetch('http://localhost:3000/api/store-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: data.userId, usertype: data.usertype, itemId, chances, dateTime, similarityPercentage, status, question, userAnswer, correctAnswer }),
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

        }
      })
      .catch(error => console.error('Error:', error));
  });
  //-----------
});
//-------------------------------------------------
innerContainer.appendChild(form);
// Append the 'Next' button to the form
//--------------------------------------------------
  // Create the close button for the second inner container
  const closeButton = createButtonWithTextAndListener('Close', () => {
    verificationContainer.style.display = 'none';
  });
  innerContainer.appendChild(closeButton);
  //---------------------------------------------
  
innerContainer.appendChild(nextButton);
    return verificationContainer;
  }
  
  //------------------------------------------------------------------------------------
    //requests container
    //seven.
  
    requestedlink.addEventListener('click', function(event) {
    
        addcontainer.style.display = 'none';
       newcontainer.style.display = 'none';
        listedContainer.style.display = 'none'; 
        questionContainer.style.display = 'none';
        questionContainernew.style.display = 'none';  
        requestsContainer.style.display = 'block'; 
  
        requestsContainer.scrollIntoView({behavior: "smooth"});
  
        setTimeout(function() {
          smoothScrollBy(0, -350);
      }, 900); // Adjust delay as needed
      });
     
    //------------------------------------------------------------ 
  
  function createCardreq(data) {
    var cardBxreq = document.createElement('div');
    cardBxreq.className = 'card__bxreq';
  
    var cardDatareq = document.createElement('div');
    cardDatareq.className = 'card__datareq';
    cardBxreq.appendChild(cardDatareq);
  
    var cardIconreq = document.createElement('div');
    cardIconreq.className = 'card__iconreq';
    var icon = document.createElement('i');
    icon.className = 'material-icons card__iconreq';
     icon.textContent = data.iconName; 
    cardIconreq.appendChild(icon);
    cardDatareq.appendChild(cardIconreq);
  
    var cardContentreq = document.createElement('div');
    cardContentreq.className = 'card__contentreq';
    cardDatareq.appendChild(cardContentreq);
  
    var titlereq = document.createElement('h3');
    titlereq.textContent = data.title; 
    cardContentreq.appendChild(titlereq);
  
    var categoryreq = document.createElement('div');
    categoryreq.className = 'categorycardreq';
    categoryreq.textContent = data.category; 
    cardContentreq.appendChild(categoryreq);
  
    var descriptionreq = document.createElement('p');
    descriptionreq.textContent = data.description; 
    cardContentreq.appendChild(descriptionreq);

    var detailedDescriptionreq = document.createElement('p');
        detailedDescriptionreq.className = 'detailed-descriptionreq';
        detailedDescriptionreq.textContent = data.detailedDescription; 
        cardContentreq.appendChild(detailedDescriptionreq);

    var verificationContainerreq = createVerificationContainer(data,data.item);
        cardBxreq.appendChild(verificationContainerreq);
      
        var linkreq = document.createElement('a');
        linkreq.href = '#';
        //--------------------------------------
        if (data.userMatch) {
          linkreq.style.display = 'none'; // Hide the button if userMatch is true
        } else if (data.itemId) {
          if (data.status === 'directed') {
            linkreq.textContent = 'Pending';
          } else if (data.status === 'fail' && data.chances === 2) {
            linkreq.textContent = 'Raise Ticket';
          } else {
            linkreq.textContent = 'Claim';
          }
        } else {
          linkreq.textContent = 'Claim';
        }

        //------------------------------------------------
        linkreq.addEventListener('click', function(event) {
          event.preventDefault();
          if (linkreq.textContent === 'Claim') {
            verificationContainerreq.style.display = 'block';
          }
        });//verification container trigger
        cardContentreq.appendChild(linkreq);
    return cardBxreq;
  }
  
  var containerreq = document.querySelector('.requestsContainer .containerreq');
  
  
  //(c)fetch card data from server collection newrequestitems for requests container (newreqitems
  var verificationAnswers = {};
var usersType = localStorage.getItem('rusertype');
var usersId = localStorage.getItem('ruserId');

  fetch(`http://localhost:3000/api/reqitems?userId=${usersId}&usertype=${usersType}`)
  .then(response => response.json())
  .then(data => {
  // Loop through the data and create a card for each item
  data.forEach(item => {
      // Store the answers in the global object
      verificationAnswers[item.itemId] = item.verificationQuest.map(q => q.answer);
    // Determine the midpoint of the questions array
    let midpoint = Math.floor(item.questions.length / 2);
    // If the number of questions is odd, add one to the midpoint
    if (item.questions.length % 2 !== 0) {
      midpoint++;
    }
    // Divide the questions array into two parts
    const firstHalf = item.questions.slice(0, midpoint).map(q => q.answer).join(' ');
    const secondHalf = item.questions.slice(midpoint).map(q => q.answer).join(', ');

      // Pass only the questions to the createCard function
      var rquestions = item.verificationQuest.map(q => q.question);
  
  var cardreq = createCardreq({
    title: item.title,
    iconName: item.iconName,
    category: item.category,
    description: firstHalf,
        detailedDescription: secondHalf,
        verificationQuest: rquestions,
        userMatch: item.userMatch, 
        itemId: item.itemId, 
        chances: item.chances,
        status: item.status,
        item: item

  });
  containerreq.appendChild(cardreq);
  });
  })
  .catch(error => console.error('Error:', error));
  
      //---------------------------------------------------------------------
   //--------------------------------------------------------------------------
  //verification container
  
  // Helper function to create an element with a specific type and class
  function createElementWithClass(type, className) {
    const element = document.createElement(type);
    element.className = className;
    return element;
  }
  // Helper function to create an element with a specific type and text
  function createElementWithText(type, text) {
    const element = document.createElement(type);
    element.textContent = text;
    return element;
  }
  // Helper function to create a button with a specific text and click event listener
  function createButtonWithTextAndListener(text, listener) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', listener);
    return button;
  }
  // Main function to create the verification container
  function createVerificationContainer(data, item) {
    // Create the outer verification container
    const verificationContainerreq = createElementWithClass('div', 'verification-container');
    verificationContainerreq.style.display = 'none'; // Initially hidden
  
    // Create the inner container
    const innerverbox = createElementWithClass('div', 'innerverbox');
    verificationContainerreq.appendChild(innerverbox);
  
    // Create the first inner box that appears when clicking claim
    const innerverbox2 = createElementWithClass('div', 'innerverbox2');
    innerverbox.appendChild(innerverbox2);
  
    // Create the heading and content for the first inner box
    const innerverboxheading = createElementWithText('h1', 'Making the claim');
    innerverbox2.appendChild(innerverboxheading);
    const innerverboxcontent = createElementWithText('p', 'You need to undergo verification to claim this item. If you understand click next to proceed');
    innerverbox2.appendChild(innerverboxcontent);
  
    // Create the second inner container
    const innerContainer = createElementWithClass('div', 'inner-container');
    innerverbox.appendChild(innerContainer);
    innerContainer.style.display = 'none'; // Initially hidden
  
    // Create the close button for the first inner box
    const innervercloseButton = createButtonWithTextAndListener('Close', () => {
      innerContainer.style.display = 'none';
      verificationContainerreq.style.display = 'none';
    });
    innerverbox2.appendChild(innervercloseButton);
  
    // Create the next button for the first inner box
    const innervernextButton = createButtonWithTextAndListener('Next', () => {
      innerverbox2.style.display = 'none';
      innerContainer.style.display = 'block';
      innerContainer.style.opacity = 0; // Start with opacity 0 for fade-in effect
      setTimeout(() => innerContainer.style.opacity = 1, 50); // Fade in
    });
    innerverbox2.appendChild(innervernextButton);
  
    // Create the heading for the second inner container
    const heading = createElementWithText('h1', 'Answer the questions below');
    innerContainer.appendChild(heading);

    let form;
    if (data && data.verificationQuest) {
      form = document.createElement('form');
      data.verificationQuest.forEach((question, index) => {
        const questionForm = document.createElement('div');
        questionForm.innerHTML = `
          <label for="question${index}">${question}</label>
          <input type="text" id="question${index}" name="question${index}">
        `;
        form.appendChild(questionForm);
      });
      
    }
  
  
  //-----------------------------------------------------------------
  //==============2 verification stage compare for requests========================
  let chances=0; //for storing chance count used in verification stage
  let status='begin';
// Create the 'Next' button with an event listener
const nextButton = createButtonWithTextAndListener('Next', (event) => {
  // Prevent the default form submission event
  event.preventDefault();

  // Handle the 'Next' button click
  const correctAnswers = verificationAnswers[data.item.itemId];
  console.log(correctAnswers);

  // Access the input values here, after the user has clicked the 'Next' button
  data.verificationQuest.forEach((question, index) => {
    const userAnswer = form.elements[`question${index}`].value;
    console.log(userAnswer);
    const correctAnswer = correctAnswers[index];
    const itemId = data.item.itemId;
    data.userId = localStorage.getItem('ruserId');
    data.usertype = localStorage.getItem('rusertype');
    const dateTime = new Date().toISOString();
  
    fetch('http://localhost:3000/api/compare-answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userAnswer, correctAnswer }),
    })
      .then(response => response.json())
      .then(responseData => {
        const { similarity, isSimilar } = responseData; //renamed data itself, to avoid
        const similarityPercentage = similarity * 100;
        console.log('Similarity:', similarity);
        if (!isSimilar) {
          console.log(`Answer to question ${index + 1} is incorrect.`);
          form.reset();
          innerverbox2.style.display = 'block';
          innerContainer.style.display = 'none';
          verificationContainerreq.style.display = 'none';
          alert("claim cannot be done");     
          chances++;
          status='fail';

          //stores data to claim collection after rejection
          fetch('http://localhost:3000/api/store-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({  userId: data.userId, usertype: data.usertype, itemId, chances, dateTime, similarityPercentage, status,question, userAnswer, correctAnswer  }),
          })
            .then(response => response.json())
            .then(storeDataResponse => console.log(storeDataResponse))
            .catch(error => console.error('Error:', error));
        } else {
          console.log(`Answer to question ${index + 1} is correct.`);
          form.reset();
          innerverbox2.style.display = 'block';
          innerContainer.style.display = 'none';
          verificationContainerreq.style.display = 'none';
          status = 'pending';

           //stores data to claim collection after initial verification if success
  fetch('http://localhost:3000/api/store-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({  userId: data.userId, usertype: data.usertype, itemId, chances, dateTime, similarityPercentage, status:'directed', question, userAnswer, correctAnswer }),
  })
    .then(response => response.json())
    .then(data1 => {
      //-------------------------------------------------------------
      fetch('http://localhost:3000/api/requestsavetop2p', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({  
          endUser: data.userId, 
          endUserType: data.usertype, 
          itemId, 
          status:'directed',
        }),
      })
      .then(response => response.json())
      .then(data2 => {
        showAlert('success', 'Success!', 'Initial Verification');

         // Get the itemtitle from the response
         let itemtitle = data2.data.itemtitle;

      setTimeout(() => {
        window.location.href = "../forum/p2p.html?topic=" + encodeURIComponent(itemtitle);
      }, 1000);
    })
      .catch(error => console.error('Error:', error));

    })
        }
      })
      .catch(error => console.error('Error:', error));
  });
  //-----------
});
//-------------------------------------------------
innerContainer.appendChild(form);
// Append the 'Next' button to the form
//--------------------------------------------------
  // Create the close button for the second inner container
  const closeButton = createButtonWithTextAndListener('Close', () => {
    verificationContainerreq.style.display = 'none';
  });
  innerContainer.appendChild(closeButton);
  //---------------------------------------------
  
innerContainer.appendChild(nextButton);
    return verificationContainerreq;
  }
    //---------------------------------------------------------------------
  
     //add container
    
     addlink.addEventListener('click', function(event) {
    
     
      requestsContainer.style.display = 'none'; 
      newcontainer.style.display = 'none';
      listedContainer.style.display = 'none'; 
      questionContainer.style.display = 'none';
      questionContainernew.style.display = 'none';
      addcontainer.style.display = 'block';
     
      addcontainer.scrollIntoView({behavior: "smooth"});
  
      setTimeout(function() {
        smoothScrollBy(0, -350);
    }, 900); // Adjust delay as needed 
    });
    //---------------------------------------------------------
  
  //create list item fn for add container
  
    function createListItem(data) {
      var listItem = document.createElement('li');
      listItem.className = 'material-list-item';
    
      var icon = document.createElement('i');
      icon.className = 'material-icons';
      icon.textContent = data.icon;
      listItem.appendChild(icon);
    
      var itemContent = document.createElement('div');
      itemContent.className = 'item-content';
      listItem.appendChild(itemContent);
    
      var itemTitle = document.createElement('span');
      itemTitle.className = 'item-title';
      itemTitle.textContent = data.title;
      itemContent.appendChild(itemTitle);
    
      var itemCategory = document.createElement('span');
      itemCategory.className = 'item-category';
      itemCategory.textContent = data.category;
      itemContent.appendChild(itemCategory);
    
      var solidBlock = document.createElement('div');
      solidBlock.className = 'solid-block';
      solidBlock.style.backgroundColor = getRandomColor(); // Set random color
      listItem.appendChild(solidBlock);
    
      var itemButton = document.createElement('button');
      itemButton.className = 'item-button';
      itemButton.textContent = 'Go';
      listItem.appendChild(itemButton);
  
      var itemDescription = document.createElement('span');
      itemDescription.className = 'item-description';
      itemDescription.textContent = data.description; 
      itemContent.appendChild(itemDescription);
    
      return listItem;
    }
    function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }
    
  //fetch list items from server
  
    var materialList = document.createElement('ul');
    materialList.className = 'material-list';
    addcontainer.appendChild(materialList);
    
   
  //(1). fetch the lists from db along with qust and create the form
    async function populateItems() {
      try {
        const response = await fetch('http://localhost:3000/additems');
        if (!response.ok) {
          throw new Error(`Network response not ok: ${response.status}`);
        }
    
        const data = await response.json();
        if (data.success) {
          data.additems.forEach(item => {
            var listItem = createListItem({
              icon: item.icon,
              title: item.name, 
              category: item.category
            });
  
  
  // Generate a unique itemId based on the current timestamp for itemid
  
  listItem.setAttribute('data-id', Date.now().toString());
  listItem.setAttribute('data-icon', item.icon);
    listItem.setAttribute('data-category', item.category);
  
    // Transform questions and verification questions into objects with question and answer properties
    const questionsWithAnswers = item.questions.map(question => ({ question, answer: null }));
    const verificationQuestionsWithAnswers = item.verificationQuest.map(question => ({ question, answer: null }));
  
    listItem.setAttribute('data-questions', JSON.stringify(questionsWithAnswers));
    listItem.setAttribute('data-verificationQuest', JSON.stringify(verificationQuestionsWithAnswers));
  
            materialList.appendChild(listItem);
  
  //-----------------------------------------------------------------------------------------------
  // Assuming you have a list of items and each item has a 'go' button
  var listItems = document.querySelectorAll('.material-list-item');
  
  listItems.forEach(function(listItem) {
    var goButton = listItem.querySelector('.item-button');
  
    goButton.addEventListener('click', function() {
      // Make the question container visible
      addcontainer.style.display = 'none';
      newcontainer.style.display = 'none';
       requestsContainer.style.display = 'none'; 
       listedContainer.style.display = 'none'; 
       questionContainernew.style.display = 'none';
       questionContainer.style.display = 'block';
  
      // Clear the form
      while (questionContainer.firstChild) {
        questionContainer.removeChild(questionContainer.firstChild);
      }
  
      // Create the form and append it to the question container
      var form = document.createElement('form');
      form.className = 'material-form';
  
     // Create the form title
  var formTitle = document.createElement('h2');
  formTitle.className = 'form-title'; // Add a CSS class
  var title = listItem.querySelector('.item-title').textContent;
  formTitle.textContent = title;
  form.appendChild(formTitle);
  
      // Create the back button
      var backButton = document.createElement('button');
      backButton.className = 'material-button back-button';
      backButton.textContent = 'Back';
     
  // Add an event listener to the back button
  backButton.addEventListener('click', function(event) {
    // Prevent the form from being submitted
    event.preventDefault();
  
    // Hide the question container
    questionContainer.style.display = 'none';
  
    // Show the old container
    addcontainer.style.display = 'block';
  });
  
  form.appendChild(backButton);
  
  var questions = JSON.parse(listItem.getAttribute('data-questions'));
  verificationQuest = JSON.parse(listItem.getAttribute('data-verificationQuest')|| '[]');
  var allQuestions = [...questions, ...verificationQuest];
  
  allQuestions.forEach(function(question,index) {
    var questionDiv = document.createElement('div');
    questionDiv.className = 'question-container';
  
    var questionLabel = document.createElement('label');
    questionLabel.className = 'question-label';
    questionLabel.textContent = question.question;
    questionDiv.appendChild(questionLabel);
  
    var questionInput = document.createElement('input');
    questionInput.className = 'question-input';
    questionInput.name = 'question' + index; 
    questionDiv.appendChild(questionInput);
  
    form.appendChild(questionDiv);
  });
  
  var submitButton = document.createElement('button');
  submitButton.className = 'material-button submit-button';
  submitButton.textContent = 'Submit';
  form.appendChild(submitButton);
  
  questionContainer.appendChild(form);
  
  // Inside the 'go' button click event listener, after the form is created
  // ...
  
  // Add the form submit event listener here, after the form is created
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
  
  
   // Add item data to the data object
  
   data.title = listItem.querySelector('.item-title').textContent;
   data.category = listItem.getAttribute('data-category');
   data.iconName = listItem.getAttribute('data-icon');
   data.questions = JSON.parse(listItem.getAttribute('data-questions'));
   data.verificationQuest = JSON.parse(listItem.getAttribute('data-verificationQuest'));
   data.userId = localStorage.getItem('ruserId');
  data.usertype = localStorage.getItem('rusertype');
  
  // Set the answers to the questions and verification questions
  data.questions.forEach((question, index) => question.answer = formData.get('question' + index));
  data.verificationQuest.forEach((question, index) => question.answer = formData.get('question' + (data.questions.length + index)));
  
   data.itemId = listItem.getAttribute('data-id');
  //-----------------
  //****/
  data.coltype='listed';
  //----------------
  //(2) Send the form data to server for listeditem collectiom
    try {
      const response = await fetch('http://localhost:3000/addquestsubmit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        throw new Error(`Network response not ok: ${response.status}`);
      }
  
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error(`Fetch operation failed: ${error.message}`);
    }
  });
  
  
  });
  });
  //-------submit button----------------------------------------------
  
  //-----------------------------------------------------------------------
  
  
  
          });
        } else {
          console.error('Failed to fetch items:', data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
    populateItems();
  
    //---------------------------------------------------------------------
  
  //NEW container
  newlink.addEventListener('click', function(event) {
    requestsContainer.style.display = 'none'; 
    listedContainer.style.display = 'none'; 
    addcontainer.style.display = 'none';
    questionContainer.style.display = 'none';
    questionContainernew.style.display = 'none';
    newcontainer.style.display = 'block';
  
    newcontainer.scrollIntoView({behavior: "smooth"});
  
    setTimeout(function() {
      smoothScrollBy(0, -350);
  }, 900); // Adjust delay as needed
  });
  //-------------------------------------------------------------------------
  //create list item new fn for new container
  function createListItemnew(data) {
    var listItemnew = document.createElement('li');
    listItemnew.className = 'material-list-item-new';
  
    var iconnew = document.createElement('i');
    iconnew.className = 'material-icons';
    iconnew.textContent = data.icon;
    listItemnew.appendChild(iconnew);
  
    var itemContentnew = document.createElement('div');
    itemContentnew.className = 'item-content-new';
    listItemnew.appendChild(itemContentnew);
  
    var itemTitlenew = document.createElement('span');
    itemTitlenew.className = 'item-title-new';
    itemTitlenew.textContent = data.title;
    itemContentnew.appendChild(itemTitlenew);
  
    var itemCategorynew = document.createElement('span');
    itemCategorynew.className = 'item-category-new';
    itemCategorynew.textContent = data.category;
    itemContentnew.appendChild(itemCategorynew);
  
    var solidBlocknew = document.createElement('div');
    solidBlocknew.className = 'solid-block-new';
    solidBlocknew.style.backgroundColor = getRandomColor();
    listItemnew.appendChild(solidBlocknew);
  
    var itemButtonnew = document.createElement('button');
    itemButtonnew.className = 'item-button-new';
    itemButtonnew.textContent = 'Go';
    listItemnew.appendChild(itemButtonnew);
  
    var itemDescriptionnew = document.createElement('span');
    itemDescriptionnew.className = 'item-description-new';
    itemDescriptionnew.textContent = data.description;
    itemContentnew.appendChild(itemDescriptionnew);
  
    return listItemnew;
  }
  
  var materialListnew = document.createElement('ul');
  materialListnew.className = 'material-list-new';
  newcontainer.appendChild(materialListnew);
  
  //-------------------------------------------------------------------
  //(a) fetch list items from server same db additems, use same route
   
  async function populateItemsnew() {
    try {
      const response = await fetch('http://localhost:3000/additems');
      if (!response.ok) {
        throw new Error(`Network response not ok: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.success) {
        data.additems.forEach(item => {
          var listItemnew = createListItemnew({
            icon: item.icon,
            title: item.name, 
            category: item.category
          });
  
  // Generate a unique itemId based on the current timestamp for itemid
  
  listItemnew.setAttribute('data-id', Date.now().toString());
  listItemnew.setAttribute('data-icon', item.icon);
  listItemnew.setAttribute('data-category', item.category);
  
  // Transform questions and verification questions into objects with question and answer properties
  const questionsWithAnswersnew = item.questions.map(question => ({ question, answer: null }));
  const verificationQuestionsWithAnswersnew = item.verificationQuest.map(question => ({ question, answer: null }));
  
  listItemnew.setAttribute('data-questions', JSON.stringify(questionsWithAnswersnew));
  listItemnew.setAttribute('data-verificationQuest', JSON.stringify(verificationQuestionsWithAnswersnew));
  
          materialListnew.appendChild(listItemnew);
  
  //-----------------------------------------------------------------------------------------------
  // Assuming you have a list of items and each item has a 'go' button
  var listItemsnew = document.querySelectorAll('.material-list-item-new');
  
  listItemsnew.forEach(function(listItemnew) {
  var goButtonnew = listItemnew.querySelector('.item-button-new');
  
  goButtonnew.addEventListener('click', function() {
    // Make the question container visible
    addcontainer.style.display = 'none';
    newcontainer.style.display = 'none';
     requestsContainer.style.display = 'none'; 
     listedContainer.style.display = 'none'; 
     questionContainer.style.display = 'none';
     questionContainernew.style.display = 'block';
  
    // Clear the form
    while (questionContainernew.firstChild) {
      questionContainernew.removeChild(questionContainernew.firstChild);
    }
  
    // Create the form and append it to the question container
    var formnew = document.createElement('form');
    formnew.className = 'material-form-new';
  
   // Create the form title
  var formTitlenew = document.createElement('h2');
  formTitlenew.className = 'form-title-new'; // Add a CSS class
  var titlenew = listItemnew.querySelector('.item-title-new').textContent;
  formTitlenew.textContent = titlenew;
  formnew.appendChild(formTitlenew);
  
    // Create the back button
    var backButtonnew = document.createElement('button');
    backButtonnew.className = 'material-button back-button-new';
    backButtonnew.textContent = 'Back';
   
  // Add an event listener to the back button
  backButtonnew.addEventListener('click', function(event) {
  // Prevent the form from being submitted
  event.preventDefault();
  
  // Hide the question container
  questionContainernew.style.display = 'none';
  
  // Show the old container
  newcontainer.style.display = 'block';
  });
  
  formnew.appendChild(backButtonnew);
  
  var questionsnew = JSON.parse(listItemnew.getAttribute('data-questions'));
  verificationQuestnew = JSON.parse(listItemnew.getAttribute('data-verificationQuest')|| '[]');
  var allQuestionsnew = [...questionsnew, ...verificationQuestnew];
  
  allQuestionsnew.forEach(function(question,index) {
  var questionDivnew = document.createElement('div');
  questionDivnew.className = 'question-container-new';
  
  var questionLabelnew = document.createElement('label');
  questionLabelnew.className = 'question-label-new';
  questionLabelnew.textContent = question.question;
  questionDivnew.appendChild(questionLabelnew);
  
  var questionInputnew = document.createElement('input');
  questionInputnew.className = 'question-input';
  questionInputnew.name = 'question' + index; 
  questionDivnew.appendChild(questionInputnew);
  
  formnew.appendChild(questionDivnew);
  });
  
  var submitButtonnew = document.createElement('button');
  submitButtonnew.className = 'material-button submit-button-new';
  submitButtonnew.textContent = 'Submit';
  formnew.appendChild(submitButtonnew);
  
  questionContainernew.appendChild(formnew);
  
  // Inside the 'go' button click event listener, after the form is created
  // ...
  
  // Add the form submit event listener here, after the form is created
  formnew.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());
  
  
  // Add item data to the data object
  
  data.title = listItemnew.querySelector('.item-title-new').textContent;
  data.category = listItemnew.getAttribute('data-category');
  data.iconName = listItemnew.getAttribute('data-icon');
  data.questions = JSON.parse(listItemnew.getAttribute('data-questions'));
  data.verificationQuest = JSON.parse(listItemnew.getAttribute('data-verificationQuest'));
  
  // Set the answers to the questions and verification questions
  data.questions.forEach((question, index) => question.answer = formData.get('question' + index));
  data.verificationQuest.forEach((question, index) => question.answer = formData.get('question' + (data.questions.length + index)));
  data.userId = localStorage.getItem('ruserId');
  data.usertype = localStorage.getItem('rusertype');
  data.itemId = listItemnew.getAttribute('data-id');
  //------------
  //*** */
  data.coltype='requested';
  //------------
  
  //(b) Send the data to server for newlisteditems collectiom
  try {
    const response = await fetch('http://localhost:3000/newreqsubmit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  
    if (!response.ok) {
      throw new Error(`Network response not ok: ${response.status}`);
    }
  
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(`Fetch operation failed: ${error.message}`);
  }
  
  });
  
  
  });
  });
  //-------submit button----------------------------------------------
  
  //-----------------------------------------------------------------------
  
  
  
  });
  } else {
    console.error('Failed to fetch items:', data.error);
  }
  } catch (error) {
  console.error('Error:', error);
  }
  }
  
  populateItemsnew();
 
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
  //---------------------------------------------------------------------
 $(document).ready(function() {
    $('.search-formmain input').on('input', function() {
      var searchValue = $(this).val().toLowerCase();
      var visibleContainer = $('.listedContainer:visible, .requestsContainer:visible, .newcontainer:visible, .addcontainer:visible, .questioncontainer:visible, .questioncontainernew:visible');
      var messageElement = $('#searchMessage', visibleContainer);
  
      if (searchValue !== '') {
        var matchCount = 0;
        var matchedItems = [];
        var unmatchedItems = [];
  
        $('.material-list-item, .material-list-item-new', visibleContainer).each(function() {
          var item = $(this);
          var itemTitle = $(' .item-title, .item-title-new', item).text().toLowerCase();
          var itemDescription = $(' .item-description, .item-description-new', item).text().toLowerCase();
  
          if (itemTitle.includes(searchValue) || itemDescription.includes(searchValue)) {
            matchedItems.push(item);
            matchCount++;
          } else {
            unmatchedItems.push(item);
          }
        });
  
        $('.card__bx, .card__bxreq', visibleContainer).each(function() {
          var card = $(this);
          
          // Adjust these selectors to match the structure of your cards
          var cardTitle = $('h3', card).text().toLowerCase();
          var cardCategory = $('.categorycard, .categorycardreq', card).text().toLowerCase();
          var cardDescription = $('p', card).text().toLowerCase();
          var cardDetailedDescription = $('.detailed-description, .detailed-descriptionreq', card).text().toLowerCase();
        
          if (cardTitle.includes(searchValue) || cardCategory.includes(searchValue) || cardDescription.includes(searchValue) || cardDetailedDescription.includes(searchValue)) {
            matchedItems.push(card);
            matchCount++;
          } else {
            unmatchedItems.push(card);
          }
        });
  
        if (matchCount === 0) {
          /*
          messageElement.text('No items match your search.');*/
//-------------------------------------------------------------------------------if (matchCount === 0) {
  // Check if the "Other" list item already exists
  var otherListItemExists = $('.other-list-item', visibleContainer).length > 0;

if (matchCount === 0) {
  // Check if the "Other" list item already exists in either container
  var otherListItemExists = $('.other-list-item', visibleContainer).length > 0;

  if (!otherListItemExists) {
    // Create a new list item
    var otherListItem = $('<li/>', {
      class: 'other-list-item',
      html: `
        <div class="list-item-icon">
          <span class="material-icons"id="othericon">help_outline</span>
        </div>
        <div class="list-item-content">
          <h3 class="list-item-title">Other</h3>
          <p class="list-item-description">Item not listed</p>
        </div>
        <div class="list-item-action">
          <div class="color-circle"></div>
          <button class="generate-button">Generate</button>
        </div>
      `
    });

    // Add the new list item to both the material-list-new and material-list-item containers
    $('.material-list-new, .material-list', visibleContainer).append(otherListItem);

     // Generate a new solid block color
     $('.color-circle', otherListItem).css('background-color', getRandomColor());

      // Add click event listener to the "Generate" button
  $('.generate-button', otherListItem).on('click', generateForm1);
    
  }
} else {
  messageElement.text('');
}

      
//-----------------------------------------------------------------------------
        } else {
          messageElement.text('');
        }
  
        // Hide all items
        matchedItems.concat(unmatchedItems).forEach(function(item) {
          item.hide();
        });
  
        // Show matched items
        $.each(matchedItems, function(i, item) {
          item.show();
        });
      } else {
        // If the search input is empty, make all items visible and remove the message
        $('.card__bx, .card__bxreq, .material-list-item, .material-list-item-new', visibleContainer).show();
        messageElement.text('');
      }
    });
  
    // Manually trigger the input event
    $('.search-formmain input').trigger('input');
  }); 
  
    //---------------------------------------------------------------------
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
  
    
//------------------------------------------------------------------
/// Data to be collected from the form
var formData = {
  itemName: '',
  category: '',
  description: ''
};

var selectedIcon; // Variable to store the selected icon

function generateForm1() {
  // Create a new form
  var form = $('<form/>', {
    class: 'form-horizontal',
    html: `
    <div class="form-title">Enter the details</div>
      <div class="form-group">
        <label for="itemName">Name of Item</label>
        <input type="text" id="itemName" placeholder="Enter the name of the item">
      </div>
      <div class="form-group">
        <label for="category">Category</label>
        <input type="text" id="category" placeholder="Category your item belongs">
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" rows="3" placeholder="describe the item"></textarea>
      </div>
      <div class="form-group">
        <button type="button" id="closeButton">Close</button>
        <button type="button" id="nextButton">Next</button>
      </div>
    `
  });

  // Append the form to the body
  $('body').append(form);

  // Create a new overlay
  var overlay = $('<div/>', {
    class: 'overlay',
    html: form
  });

  // Append the overlay to the body
  $('body').append(overlay);

  // Add click event listener to the "Close" button
  $('#closeButton').on('click', function() {
    overlay.remove(); /* Remove the overlay */
  });

  // Add click event listener to the "Next" button
  $('#nextButton').on('click', nextFunction);
}

function nextFunction() {
   // Get the data from the form and store it
   formData.itemName = $('#itemName').val();
   formData.category = $('#category').val();
   formData.description = $('#description').val();

  // Check if the form data is empty
  if (!formData.itemName && !formData.category && !formData.description) {
    alert('Please fill out the form before proceeding.');
    return;
  }
  
  // Get the description from the form
  var description = $('#description').val();
  $('.form-horizontal').remove();

  // Create a new form with a preloader and a "Generating..." label
  var form = $('<form/>', {
    class: 'form-horizontalloader',
    html: `
    <div class="form-horizontaltitle">Generating</div>
    <div class="formloader"></div>
    `
  });

  // Create a new overlay
  var overlay = $('<div/>', {
    class: 'overlay',
    html: form
  });

  // Append the overlay to the body
  $('body').append(overlay);

  // Send the description to the model
  fetch('https://8ebe-104-197-132-117.ngrok-free.app/generate_questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: description
    }),
  })
  .then(response => response.json())
  .then(data => {
    // Remove the preloader and the "Generating..." label
    $('.form-horizontaltitle').remove();
    $('.formloader').remove();

    // Animate the form width from 20% to 50%
    $('.form-horizontalloader').animate({ width: '50%' }, 1000); // 1000ms = 1s

    // Add the generated questions, verification question and answer fields, and buttons to the form
    form.append(`
      <div class="form-title">Generated Questions</div>
      <div class="form-group">
        <label for="question">Question</label>
        <textarea id="question" rows="3">${data.question}</textarea>
      </div>
      <div class="form-group">
        <label for="answer">Answer</label>
        <textarea id="answer" rows="3">${data.answer}</textarea>
      </div>
      <div class="form-group">
        <label for="verificationQuestion">Verification Question</label>
        <textarea id="verificationQuestion" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label for="verificationAnswer">Verification Answer</label>
        <textarea id="verificationAnswer" rows="3"></textarea>
      </div>
      <div class="form-group">
        <button type="button" id="iconselect">Select Icon</button>
        <button type="button" id="backButton">Back</button>
        <button type="button" id="saveButton">Save</button>
      </div>
    `);

    // Add event listener to the "Select Icon" button
    $('#iconselect').on('click', function() {
      // Check if the box is already displayed
      if ($('#iconBox').length) {
        // If it is, toggle its visibility
        $('#iconBox').toggle();
      } else {
        // If it's not, create the box and display the icons

        // Array of Google Material icons
        var icons = ['home', 'delete', 'edit', 'save', 'mail']; // Add all the icons you want to display

        // Create a box
        var box = $('<div id="iconBox"></div>');

        // Iterate over the icons
        icons.forEach(function(icon) {
          // Create an icon element
          var iconElement = $(`<i class="material-icons material-icon">${icon}</i>`);

          // Add click event listener to the icon
          iconElement.on('click', function() {
            // Store the selected icon
            selectedIcon = icon;

            // You can do something with the selected icon here
            console.log('Selected icon:', selectedIcon);
          });

          // Append the icon element to the box
          box.append(iconElement);
        });

        // Append the box to the form
        form.append(box);
      }
    });

    // Add click event listener to the "Back" button
    $('#backButton').on('click', backFunction);

    // Add click event listener to the "Save" button
    $('#saveButton').on('click', saveFunction);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

function backFunction() {
  // Remove the current form
  $('.overlay').remove();

  // Regenerate the previous form
  generateForm1();
}

function saveFunction() {
  // Check if the required fields are filled out
  if (!$('#question').val() || !$('#answer').val() || !$('#verificationQuestion').val() || !$('#verificationAnswer').val() || !selectedIcon) {
    alert('Please fill out all the fields and select an icon before saving.');
    return;
  }

  // Get the data from the form
  var question = $('#question').val();
  var answer = $('#answer').val();
  var verificationQuestion = $('#verificationQuestion').val();
  var verificationAnswer = $('#verificationAnswer').val();

  // Generate a unique itemId based on the current timestamp
  var itemId = Date.now().toString();

  // Transform questions and verification questions into objects with question and answer properties
  var questionsWithAnswers = [{ question: question, answer: answer }];
  var verificationQuestionsWithAnswers = [{ question: verificationQuestion, answer: verificationAnswer }];

  // Get user data from localStorage
  var data = {
    userId: localStorage.getItem('ruserId'),
    usertype: localStorage.getItem('rusertype')
  };

  // Send the data to the server
    fetch('http://localhost:3000/addquestsubmit', { // Change this to your server URL)
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coltype: 'listed',
      title: formData.itemName,
      iconName: selectedIcon,
      category: formData.category,
      questions: questionsWithAnswers,
      verificationQuest: verificationQuestionsWithAnswers,
      itemId: itemId,
      userId: data.userId,
      usertype: data.usertype
    }),
  })
  .then(response => response.json())
  .then(data => {
    showAlert('success', 'Success!', 'Item added successfully!');
  })
  .catch(error => {
    console.error('Error saving ListedItem:', error);
  });
}

//----------------------------------------------------------------------
//=======================================================================================================
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
//------------------------------------------------------------------
  //-----------------------------------------------------------------------
});
