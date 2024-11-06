document.addEventListener('DOMContentLoaded', (event) => {
//---------------------------------------------------------------------
//fetch student db data
/*let contributions;*/
var Username;
var Contributions = 10; //set globally
const id = localStorage.getItem('ruserId');
(async function() {
  try {
    const response = await fetch(`http://localhost:3000/api/studentdata/${id}`);
    const data = await response.json();

    const {
      ktuid,
      username,
      email,
      firstName,
      lastName,
      department,
      semester,
      profileImage,
      contributions,
     //set here  Contributions = contributions;
     Username = username,
    } = data;
localStorage.setItem('rusername', Username);
    //console.log(ktuid,username, email, firstName, lastName, department, semester, profileImage, contributions);



   
// Populate the form with the student profile data
//update form
document.getElementById("username").placeholder = username;
document.getElementById("firstname").placeholder = firstName;
document.getElementById("lastname").placeholder = lastName;
document.getElementById("email").placeholder = email;
document.getElementById("semester").placeholder = semester;
document.getElementById("branch").placeholder = department;

//welcome title username
document.getElementById("prfwel").innerText = username;

//container data update
document.getElementById("Ktuid").innerText = ktuid;
document.getElementById("name").innerText = firstName;//username as id in html
document.getElementById("infosem").innerText = semester;
document.getElementById("dept").innerText = department;

// navbar  image and form image:
const profileImagePath = profileImage ? '/' + profileImage.replace(/\\/g, '/') : '/default/path/to/image';
document.getElementById("profileImage").src = profileImagePath;
document.getElementById("profileimg").src = profileImagePath;//navbar

//contribution badges
// Hide all badges initially
let badges = document.querySelectorAll('.badge img');


// Show badges based on contributions
if (Contributions >= 1) {
  document.getElementById('bd1').style.display = 'block';
}
if (Contributions >= 2) {
  document.getElementById('bd2').style.display = 'block';
}
if (Contributions >= 5) {
  document.getElementById('bd5').style.display = 'block';
}
if (Contributions >= 10) {
  document.getElementById('bd10').style.display = 'block';
}
//badges calculation
let badgeCount=0, points=0;

if (Contributions >= 10) {
    badgeCount = 4;
} else if (Contributions >= 5) {
    badgeCount = 3;
} else if (Contributions >= 2) {
    badgeCount = 2;
} else if (Contributions >= 1) {
    badgeCount = 1;
} else {
    badgeCount = 0;
}



// Populate the contribution data
document.getElementById("conno").innerText = Contributions;
document.getElementById("conpoint").innerText = Contributions * 10;
document.getElementById("conbad").innerText = badgeCount;


  } catch (error) {
    console.error('Error:', error);
  }
})();

//--------------------------------------------------------------------------
try {
    // Create an object for month pairs with their values
    var monthPairs = {
        'Jan,Feb': 0,
        'Mar,Apr': 0,
        'May,Jun': 0,
        'Jul,Aug': 0,
        'Sep,Oct': 0,
        'Nov,Dec': 0,
    };
  
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(monthPairs),
            datasets: [{
                label: 'Contributions',
                data: Object.values(monthPairs),
                fill: false,
                borderColor: 'black',
                backgroundColor: 'black',
                pointBackgroundColor: 'black',
                pointBorderColor: 'black',
                borderWidth: 1,
                tension: 0.3
            }]
        },
        options: {
            scales: {
                x: {
                    display: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0)'
                    },
                    ticks: {
                        color: 'black',
                        
                    }
                },
                y: {
                    display: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0)'
                    },
                    ticks: {
                        color: 'black',
                        min: 0,
                        max: 10,
                        stepSize: 2
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: 'black',
                    display: true,
                    formatter: function(value, context) {
                        return value;
                    }
                }
            }
        }
    });
  
    // Get the current month
    var date = new Date();
    var month = date.toLocaleString('default', { month: 'short' });
  
    // Map the current month to the corresponding pair
    var monthPair;
    for (var pair in monthPairs) {
        if (pair.includes(month)) {
            monthPair = pair;
            break;
        }
    }
  
    // Update the value in the monthPairs object
    monthPairs[monthPair] = Contributions;
  
    // Update the data in the chart
    myChart.data.datasets[0].data = Object.values(monthPairs);
    myChart.update();
  } catch (error) {
    console.error('Error in chart code:', error);
  }
//--------------------------------------------------------

//---------------------------------------------------------
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
  
  // Select the listReqContainer
var listReqContainer = document.querySelector('.listreqcont');

//------------

//(fetch list data for my requests from server collection newrequestitems for myitems container in profile page where student id and usertype matches)
let ruserId = localStorage.getItem('ruserId'); 
fetch(`http://localhost:3000/api/studentreqitems?usertype=student&userId=${ruserId}`)
.then(response => response.json())

.then(data => {
  // Loop through the data and create a list for each item
  data.forEach(item => {
    // Determine the midpoint of the questions array
    let midpoint = Math.floor(item.questions.length / 2);
    // If the number of questions is odd, add one to the midpoint
    if (item.questions.length % 2 !== 0) {
      midpoint++;
    }
    // Divide the questions array into two parts
    const firstHalf = item.questions.slice(0, midpoint).map(q => q.answer).join(' ');
    const secondHalf = item.questions.slice(midpoint).map(q => q.answer).join(', ');

    var listItem = createListItem({
        icon: item.iconName,
      title: item.title, 
      category: item.category,
      description: `${firstHalf}...${secondHalf}`
    });
    //-----------------

    // Append the listItem to the container
    listReqContainer.appendChild(listItem);
  });
})
//--------------------------------------------------------

//--------------------------------------------------------
//redirections
//0. redirect to listing page
document.getElementById('listingpage').addEventListener('click', function() {
    console.log('Redirecting to listing page');
    window.location.href = "../../Listing/listingloader.html";
    });
//1. redirect to discussion page
document.getElementById('discussion').addEventListener('click', function() {
  window.location.href = "../../forum/forum.html";
  });
  //2. shift between listreqcont and myreportcont
  myreportshift=document.getElementById('myreportshift');
  mylistshift=document.getElementById('mylistshift');
  myreportcont=document.querySelector('.myreportcont');
  listreqcont=document.querySelector('.listreqcont');
 myreportshift.addEventListener('click', function() {
  listreqcont.style.display = 'none';
  myreportcont.style.display = 'block';
 });
  mylistshift.addEventListener('click', function() {
  myreportcont.style.display = 'none';
  listreqcont.style.display = 'block';
  });

//---------------------------------------------------------
var profilecontainer = document.querySelector('.profilecontainer');
var updatebtn = document.getElementById('stdprfupd');
var overlay = document.getElementById('overlay');
var closeBtn = document.getElementById('close-btn');

updatebtn.addEventListener('click', function() {
    profilecontainer.style.display = 'block';
    overlay.style.display = 'block';
});

closeBtn.addEventListener('click', function() {
    profilecontainer.style.display = 'none';
    overlay.style.display = 'none';
});

var isEditing = false;


document.getElementById('editIcon').addEventListener('click', function() {
    var inputs = document.getElementsByTagName('input');
    if (!isEditing) {
        // If not currently editing, enable editing
        document.getElementById('uploadLabel').style.display = 'block';
        document.querySelector('.bw-btn').style.display = 'block';
        for(var i = 0; i < inputs.length; i++) {
            inputs[i].removeAttribute('readonly');
        }
        isEditing = true;
    } else {
        // If currently editing, disable editing
        document.getElementById('uploadLabel').style.display = 'none';
        document.querySelector('.bw-btn').style.display = 'block';
        for(var i = 0; i < inputs.length; i++) {
            inputs[i].setAttribute('readonly', true);
        }
        isEditing = false;
    }
});

document.getElementById('imageUpload').addEventListener('change', function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();

    reader.onloadend = function() {
        document.querySelector('.profile-pic-container img').src = reader.result;
    }

    if (file) {
        reader.readAsDataURL(file);
    }
});
//------------------------------------------------------------------
function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function validatePassword(oldPassword, newPassword) {
    // Check if old password matches new password
    if (oldPassword === newPassword) {
        showAlert('error', 'Error!', 'Passwords are same');
        return false;
    }
    return true;
}

function validateSemester(semester) {
    // Semester should be less than or equal to 8 and greater than 0
    if (semester <= 0 || semester > 8) {
        showAlert('error', 'Error!', 'Invalid Semester');
        return false;
    }
    return true;
}

document.querySelector('.bw-form').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const formData = new FormData();
    const email = document.getElementById('email').value;
    const oldPassword = document.getElementById('oldpassword').value;
    const newPassword = document.getElementById('newpassword').value;
    const semester = document.getElementById('semester').value;
    const username = document.getElementById('username').value; 
  
    if (!validateEmail(email)) {
        showAlert('error', 'Error!', 'Invalid Email');
        return;
    }
  
    if (!validatePassword(oldPassword, newPassword)) {
        return;
    }

    if (!validateSemester(semester)) {
        return;
    }
  
    formData.append('firstName', document.getElementById('firstname').value);
    formData.append('lastName', document.getElementById('lastname').value);
    formData.append('email', email);
    formData.append('oldPassword', oldPassword);
    formData.append('newPassword', newPassword);
    formData.append('semester', semester);
    formData.append('department', document.getElementById('branch').value);
    formData.append('profileImage', document.getElementById('imageUpload').files[0]);
    formData.append('username', username); 
    const userId = localStorage.getItem('ruserId');
  
    try {
        const response = await fetch(`http://localhost:3000/studentupdate/${userId}`, {
            method: 'PUT',
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            throw err;
        }

        const data = await response.json();
        console.log(data);
        showAlert('success', 'Success!', 'Update successful!');
    } catch (error) {
        alert('Error: ' + error.message);
    }
});
//-------------------------student my reports item fetch------------------------------

function createListrep(data) {
  var listrepItem = document.createElement('li');
  listrepItem.className = 'material-list-repitem';

  var icon = document.createElement('i');
  icon.className = 'material-icons';
  icon.textContent = data.icon;
  listrepItem.appendChild(icon);

  var itemContentrep = document.createElement('div');
  itemContentrep.className = 'item-contentrep';
  listrepItem.appendChild(itemContentrep);

  var itemTitlerep = document.createElement('span');
  itemTitlerep.className = 'item-titlerep';
  itemTitlerep.textContent = data.title;
  itemContentrep.appendChild(itemTitlerep);

  var itemCategoryrep = document.createElement('span');
  itemCategoryrep.className = 'item-categoryrep';
  itemCategoryrep.textContent = data.category;
  itemContentrep.appendChild(itemCategoryrep);

  var solidBlock = document.createElement('div');
  solidBlock.className = 'solid-block';
  solidBlock.style.backgroundColor = getRandomColor(); // Set random color
  listrepItem.appendChild(solidBlock);

  if (data.showButton) {
  var itemButtonrep = document.createElement('button');
  itemButtonrep.className = 'item-buttonrep';
  itemButtonrep.textContent = 'Check';
  itemButtonrep.addEventListener('click', function() {
    createApprovalContainer(data.claimData,data.listedItem);
  });
  listrepItem.appendChild(itemButtonrep);
  }

  var itemDescriptionrep = document.createElement('span');
  itemDescriptionrep.className = 'item-descriptionrep';
  itemDescriptionrep.textContent = data.description; 
  itemContentrep.appendChild(itemDescriptionrep);
  //---------------------------------------------------------
  if (!data.claimData) {
    var deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function() {
     //-----------------------------------------------------
     Swal.fire({
      title: 'Are you sure?',
      text: 'It will remove your listed item!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: ' Delete',
      cancelButtonText: 'No',
      backdrop: 'rgba(0,0,0,0.4)',
      confirmButtonColor: '#000',
      customClass: {
        title: 'my-alerttitle-class',
        content: 'my-alertcontent-class',
        confirmButton: 'my-alertconfirm-button-class'
      }
    }).then((result) => {
      if (result.isConfirmed) {
//------------------------------------------------------------------
fetch(`http://localhost:3000/api/studentdelitems/${data._id}`, {
  method: 'DELETE',
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    listrepItem.remove();
  } else {
    console.error('Error:', data.error);
  }
})
.catch((error) => {
  console.error('Error:', error);
});
 //----------------------------------------------------------------
      }
    });
    });
    listrepItem.appendChild(deleteButton);
  }
  //---------------------------------------------------------
  return listrepItem;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Select the listReqContainer
var myreportcont = document.querySelector('.myreportcont');

//------------

//(fetch list data for my reports from server collection listeditems for myreportitems container in profile page where student id and usertype matches)
let repuserId = localStorage.getItem('ruserId'); 
fetch(`http://localhost:3000/api/studentreporteditems?usertype=student&userId=${repuserId}`)
.then(response => response.json())
.then(data => {
  // Loop through the data and create a list for each item
  data.forEach(({listedItem, claimData}) => {
    console.log(listedItem.title)
    // Determine the midpoint of the questions array
    let midpoint = Math.floor(listedItem.questions.length / 2);
    // If the number of questions is odd, add one to the midpoint
    if (listedItem.questions.length % 2 !== 0) {
      midpoint++;
    }
    // Divide the questions array into two parts
    const firstHalf = listedItem.questions.slice(0, midpoint).map(q => q.answer).join(' ');
    const secondHalf = listedItem.questions.slice(midpoint).map(q => q.answer).join(', ');
    console.log('Show Button:', claimData ? claimData.status === 'pending' : false); // Log the showButton value
    var listItemrep = createListrep({
        icon: listedItem.iconName,
      title: listedItem.title, 
      category: listedItem.category,
      description: `${firstHalf}...${secondHalf}`,
    showButton: claimData ? claimData.status === 'pending' : false,
    claimData: claimData,
    _id: listedItem._id,
    listedItem: listedItem
    });

    // Append the listItem to the container
    myreportcont.appendChild(listItemrep);
  });
})
//------------------------------------------------------------------
//approval container

function createApprovalContainer(claimData, listedItem) {
  var approvalContainer = document.createElement('div');
  approvalContainer.className = 'approval-container';

  var innerContainer = document.createElement('div');
  innerContainer.className = 'innerverbox';

  var title = document.createElement('h1');
  title.textContent = 'Validate the Claim';
  innerContainer.appendChild(title);

  // Add claim list data
  var claimDataText = document.createElement('p');
  claimDataText.textContent = `Similarity Percentage: ${claimData.similarityPercentage}\nQuestion: ${claimData.question}\nUser Answer: ${claimData.userAnswer}\nCorrect Answer: ${claimData.correctAnswer}\nDate Time: ${claimData.dateTime}`;
  innerContainer.appendChild(claimDataText);

  // Add buttons
  var closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', function() {
    document.body.removeChild(approvalContainer);
  });
  innerContainer.appendChild(closeButton);
//--------------------------------------------------------------------
  var approveButton = document.createElement('button');
  approveButton.textContent = 'Approve';
  //---------------------
//approve button click event
approveButton.addEventListener('click', function() {
  
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to approve this claim?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Approve',
    cancelButtonText: 'No',
    backdrop: 'rgba(0,0,0,0.4)',
    confirmButtonColor: '#000',
    customClass: {
      title: 'my-alerttitle-class',
      content: 'my-alertcontent-class',
      confirmButton: 'my-alertconfirm-button-class'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      var ownerUser = localStorage.getItem('ruserId');
      var ownerUserType = localStorage.getItem('rusertype');
      var endUser = claimData.userId;
      var endUserType = claimData.usertype;
      var itemId = claimData.itemId;
      var status = 'directed';
     

      fetch(`http://localhost:3000/api/saveToP2P`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerUser: ownerUser,
          ownerUserType: ownerUserType,
          endUser: endUser,
          endUserType: endUserType,
          itemId: itemId,
          status: status,
          itemtitle: listedItem.title,
        }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Data saved successfully');
//---------------------------------------------
  //update status in claimlist collection
  return fetch(`http://localhost:3000/api/updateClaimStatus`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      itemId: itemId,
      status: status
    }),
  });
}else {
          console.error('Error:', data.error);
        }
      })
      .then(response => response.json()) 
      .then(data => {
        if (data.success) {
          console.log('Claim status updated successfully');
        } else {
          console.log('Data:', data);
          console.error('Error:', data.error);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  });
});
innerContainer.appendChild(approveButton);
//-----------------------------------------------------------------------
  var rejectButton = document.createElement('button');
  rejectButton.textContent = 'Reject';
  //add here rejection case
  innerContainer.appendChild(rejectButton);

  approvalContainer.appendChild(innerContainer);
  document.body.appendChild(approvalContainer);
}
//---------------------------------------------------------------

//------------------------------------------------------------------
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
});