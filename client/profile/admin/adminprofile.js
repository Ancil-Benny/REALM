document.addEventListener('DOMContentLoaded', function() {
  // Select all navbars
  var navbars = document.querySelectorAll('.navbar');

  navbars.forEach(function(navbar) {
    // Select navbar items of current navbar
    var navbarItems = navbar.querySelectorAll('.navbar-item');

    // Add 'active' class to the first tab of current navbar
    if (navbarItems.length > 0) {
      navbarItems[0].classList.add('active');
    }

    navbarItems.forEach(function(item) {
      item.addEventListener('click', function() {
        // Remove 'active' class from all tabs of current navbar
        navbarItems.forEach(function(item) {
          item.classList.remove('active');
        });

        // Add 'active' class to clicked tab
        this.classList.add('active');
      });
    });
  });



//----------------------------------------------------------------
// Fetch data from the database
fetch('http://localhost:3000/api/tickets')
  .then(response => response.json())
  .then(data => {
    // Log the data and its type to the console
    console.log('Data:', data);
    console.log('Type of data:', typeof data);

    // For each document in the data.data
    data.data.forEach((doc, index) => {
      // Create a form
      var form = document.createElement('form');
      form.className = 'ticket-form';

      // Create a ticket number
      var ticketNumber = document.createElement('div');
      ticketNumber.textContent = 'Document ' + (index + 1);
      ticketNumber.className = 'ticket-number';
      form.appendChild(ticketNumber);

      // For each field in the document
      for (var field in doc) {
        // Create a label
        var label = document.createElement('label');
        label.htmlFor = field + index;
        label.textContent = field;
        label.className = 'ticket-label';

        // Create an input
        var input = document.createElement('input');
        input.id = field + index;
        input.name = field + index;
        input.value = doc[field];
        input.className = 'ticket-input';

        // Append the label and input to the form
        form.appendChild(label);
        form.appendChild(input);
      }

      // Append the form to the container
      var container = document.querySelector('.raisecontainer');
      container.appendChild(form);
    });
  })
  .catch(error => console.error('Error:', error));

//------------------------------------------------------------------------------------------------------------------------
function createVerifyForm(data) {
  var overlay2 = document.createElement('div');
  overlay2.className = 'overlay2';
  document.body.appendChild(overlay2);

  var verifyform = document.createElement('form');
  verifyform.className = 'verify-form';
  overlay2.appendChild(verifyform);

  // Create an image element and set its source to the student's idImage
  var idImage = document.createElement('img');
  idImage.src = "/" + data.idImage;
  verifyform.appendChild(idImage);

  var buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';
  verifyform.appendChild(buttonContainer);

  // Create a verify button
    var verifyButton = document.createElement('button');
  verifyButton.textContent = 'Verify';
  buttonContainer.appendChild(verifyButton);

  // Add an event listener to the verify button
  verifyButton.addEventListener('click', function(event) {
    event.preventDefault();
//--------------------------------------------------------------------------
Swal.fire({
  title: 'Are you sure?',
  text: 'Do you want to verify this student?',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes',
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
    fetch(`http://localhost:3000/api/verifyStudent/${data._id}`, {
      method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showAlert('success', 'Success!', 'Verification successful!');
        overlay2.remove();
        window.location.reload();
      } else {
        console.error('Error:', data.error);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
});

  });
//--------------------------------------------------------------------------
  // Create a close button
  var closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  buttonContainer.appendChild(closeButton);

  // Add an event listener to the close button
  closeButton.addEventListener('click', function(event) {
    event.preventDefault();
    // Close the form
    overlay2.remove();
  });

  return {verifyform, overlay2};
}
//----------------------------------------------------------------
//1. usercontainer
//1.b std list
//create list item fn for std container
function createListItemstd(data, index) {
  
  var stdlistItem = document.createElement('li');
  stdlistItem.className = 'student-list-item';

  var sno = document.createElement('span');
  sno.className = 'stdsno';
  sno.textContent = index + 1; // S.No starts from 1
  stdlistItem.appendChild(sno);

  
  var KtuId = document.createElement('span');
  KtuId.className = 'item-ktu-id';
  KtuId.textContent = data.ktuid;
  stdlistItem.appendChild(KtuId);

  var name = document.createElement('span');
  name.className = 'stdname';
  name.textContent = data.username; // Changed from data.name
  stdlistItem.appendChild(name);

  var email = document.createElement('span');
  email.className = 'stdemail';
  email.textContent = data.email;
  stdlistItem.appendChild(email);

  var dept = document.createElement('span');
  dept.className = 'stddept';
  dept.textContent = data.department; // Changed from data.dept
  stdlistItem.appendChild(dept);

  var semester = document.createElement('span');
  semester.className = 'stdsemester';
  semester.textContent = data.semester;
  stdlistItem.appendChild(semester);

  var solidBlocknew = document.createElement('div');
  solidBlocknew.className = 'solid-block-new';
  solidBlocknew.style.backgroundColor = getRandomColor();
  stdlistItem.appendChild(solidBlocknew);
  
  var editButton = document.createElement('button');
  editButton.className = 'stdedit-button';
  editButton.textContent = 'Edit';
  stdlistItem.appendChild(editButton);

  editButton.addEventListener('click', function() {
    var {editForm, overlay2} = createEditForm(data);
    overlay2.appendChild(editForm);
    document.body.appendChild(overlay2); // Append the overlay to the body
  });
  if (data.verify) {
    var verifiedText = document.createElement('span');
    verifiedText.textContent = 'Verified';
    stdlistItem.appendChild(verifiedText);
  } else {
  var verifyButton = document.createElement('button');
  verifyButton.className = 'stdverify-button';
  verifyButton.textContent = 'Verify';
  stdlistItem.appendChild(verifyButton);

  verifyButton.addEventListener('click', function() {
    var {verifyform, overlay2} = createVerifyForm(data);
    overlay2.appendChild(verifyform);
    document.body.appendChild(overlay2);
  });
}
  return stdlistItem;
}
  
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
//----------------------------------------------------------------
//edit button function
function createEditForm(data) {
  var overlay2 = document.createElement('div');
  overlay2.className = 'overlay2';
  document.body.appendChild(overlay2);

  var editForm = document.createElement('form');
  editForm.className = 'edit-form';
  overlay2.appendChild(editForm);

  var nameLabel = document.createElement('label');
  nameLabel.textContent = 'Name';
  editForm.appendChild(nameLabel);

  var nameInput = document.createElement('input');
  nameInput.value = data.username;
  editForm.appendChild(nameInput);

  var emailLabel = document.createElement('label');
  emailLabel.textContent = 'Email';
  editForm.appendChild(emailLabel);

  var emailInput = document.createElement('input');
  emailInput.value = data.email;
  editForm.appendChild(emailInput);

  var semesterLabel = document.createElement('label');
  semesterLabel.textContent = 'Semester';
  editForm.appendChild(semesterLabel);

  var semesterInput = document.createElement('input');
  semesterInput.value = data.semester;
  editForm.appendChild(semesterInput);

  var idLabel = document.createElement('label');
  idLabel.textContent = 'ID';
  editForm.appendChild(idLabel);

  var idInput = document.createElement('input');
  idInput.value = data._id;
  idInput.readOnly = true;
  editForm.appendChild(idInput);

  var ktuIdLabel = document.createElement('label');
  ktuIdLabel.textContent = 'KTU ID';
  editForm.appendChild(ktuIdLabel);

  var ktuIdInput = document.createElement('input');
  ktuIdInput.value = data.ktuid;
  editForm.appendChild(ktuIdInput);

  var passwordLabel = document.createElement('label');
  passwordLabel.textContent = 'Password';
  editForm.appendChild(passwordLabel);

  var passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  editForm.appendChild(passwordInput);

  var updateButton = document.createElement('button');
  updateButton.type = 'submit';
  updateButton.textContent = 'Update';
  editForm.appendChild(updateButton);

  var DeleteButton = document.createElement('button');
  DeleteButton.textContent = 'Delete';
  editForm.appendChild(DeleteButton);

  DeleteButton.addEventListener('click', function(event) {
    event.preventDefault(); 
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to Delete this Student?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
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
        fetch(`http://localhost:3000/api/adminstddel/${data._id}`, {
          method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            showAlert('success', 'Success!', 'Deletion successful!');
            overlay2.remove();
            window.location.reload();
          } else {
            console.error('Error:', data.error);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
    });
  });

  //------------------------------------------------------------------------------------------------------------------------
  var closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  editForm.appendChild(closeButton);

  closeButton.addEventListener('click', function(event) {
    event.preventDefault(); 
    overlay2.remove();
  });

  var originalData = {
    username: nameInput.value,
    email: emailInput.value,
    semester: semesterInput.value,
    _id: idInput.value,
    ktuid: ktuIdInput.value,
    password: passwordInput.value
  };

  updateButton.addEventListener('click', function(event) {
    event.preventDefault(); 
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
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

      // Later, when the form is submitted...
      var updatedData = {
        _id: idInput.value, // Always include _id
      };

if (nameInput.value !== originalData.username) updatedData.username = nameInput.value;
if (emailInput.value !== originalData.email) updatedData.email = emailInput.value;
if (semesterInput.value !== originalData.semester) updatedData.semester = semesterInput.value;
if (idInput.value !== originalData._id) updatedData._id = idInput.value;
if (ktuIdInput.value !== originalData.ktuid) updatedData.ktuid = ktuIdInput.value;
if (passwordInput.value !== originalData.password && passwordInput.value !== '') updatedData.password = passwordInput.value;
        fetch('http://localhost:3000/api/adminstdupdate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
            body: JSON.stringify(updatedData),
        
        })
        .then(response => response.json())
        .then(data => {
          showAlert('success', 'Success!', 'Update successful!');
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
    });
  });

  return {editForm, overlay2};
}
//----------------------------------------------------------------
function populateStudentContainer() {
  var stdcontainer = document.querySelector('.stdcontainer');
  
    // Fetch the students data from the server
    fetch('http://localhost:3000/api/adminstudentsget')
      .then(response => response.json())
      .then(result => {
        var students = result.data; // Access the data property
        
        // Check if there are any students
        if (students.length === 0) {
          var noStudentsLabel = document.createElement('p');
          noStudentsLabel.textContent = 'No students';
          stdcontainer.appendChild(noStudentsLabel);
        } else {
          // Create list items for each student
          for (var i = 0; i < students.length; i++) {
            var stdlistItem = createListItemstd(students[i], i);
            stdcontainer.appendChild(stdlistItem);
          }
        }
      })
      .catch(error => console.error('Error:', error));
  }


// Call the function to populate the student container
populateStudentContainer();
//---------------------------------------------------------------------------------
//----------------------------------------------------------------
//1. usercontainer
//1.b faculty list
//create list item fn for faculty container
function createListItemfac(data, index) {
  
  var faclistItem = document.createElement('li');
  faclistItem.className = 'fac-list-item';

  var sno = document.createElement('span');
  sno.className = 'stdsno';
  sno.textContent = index + 1; // S.No starts from 1
  faclistItem.appendChild(sno);


  var name = document.createElement('span');
  name.className = 'stdname';
  name.textContent = data.username; // Changed from data.name
  faclistItem.appendChild(name);

  var email = document.createElement('span');
  email.className = 'stdemail';
  email.textContent = data.email;
  faclistItem.appendChild(email);

  var dept = document.createElement('span');
  dept.className = 'stddept';
  dept.textContent = data.department; // Changed from data.dept
  faclistItem.appendChild(dept);

  var solidBlocknew = document.createElement('div');
  solidBlocknew.className = 'solid-block-new';
  solidBlocknew.style.backgroundColor = getRandomColor();
  faclistItem.appendChild(solidBlocknew);
  
  var editButton = document.createElement('button');
  editButton.className = 'stdedit-button';
  editButton.textContent = 'Edit';
  faclistItem.appendChild(editButton);

  editButton.addEventListener('click', function() {
    var {editForm, overlay2} = createEditFormfac(data);
    overlay2.appendChild(editForm);
    document.body.appendChild(overlay2); // Append the overlay to the body
  });
  return faclistItem;
}
  
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
//----------------------------------------------------------------
//edit button function
function createEditFormfac(data) {
  var overlay2 = document.createElement('div');
  overlay2.className = 'overlay2';
  document.body.appendChild(overlay2);

  var editForm = document.createElement('form');
  editForm.className = 'edit-form';
  overlay2.appendChild(editForm);

  var nameLabel = document.createElement('label');
  nameLabel.textContent = 'Name';
  editForm.appendChild(nameLabel);

  var nameInput = document.createElement('input');
  nameInput.value = data.username;
  editForm.appendChild(nameInput);

  var emailLabel = document.createElement('label');
  emailLabel.textContent = 'Email';
  editForm.appendChild(emailLabel);

  var emailInput = document.createElement('input');
  emailInput.value = data.email;
  editForm.appendChild(emailInput);


  var idLabel = document.createElement('label');
  idLabel.textContent = 'ID';
  editForm.appendChild(idLabel);

  var idInput = document.createElement('input');
  idInput.value = data._id;
  idInput.readOnly = true;
  editForm.appendChild(idInput);

  var passwordLabel = document.createElement('label');
  passwordLabel.textContent = 'Password';
  editForm.appendChild(passwordLabel);

  var passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  editForm.appendChild(passwordInput);

  var updateButton = document.createElement('button');
  updateButton.type = 'submit';
  updateButton.textContent = 'Update';
  editForm.appendChild(updateButton);

  var DeleteButton = document.createElement('button');
  DeleteButton.textContent = 'Delete';
  editForm.appendChild(DeleteButton);

  DeleteButton.addEventListener('click', function(event) {
    event.preventDefault(); 
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to Delete this Student?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
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
        fetch(`http://localhost:3000/api/adminfacdel/${data._id}`, {
          method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            showAlert('success', 'Success!', 'Deletion successful!');
            overlay2.remove();
            window.location.reload();
          } else {
            console.error('Error:', data.error);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
    });
  });

  //------------------------------------------------------------------------------------------------------------------------
  var closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  editForm.appendChild(closeButton);

  closeButton.addEventListener('click', function(event) {
    event.preventDefault(); 
    overlay2.remove();
  });

  var originalData = {
    username: nameInput.value,
    email: emailInput.value,
    _id: idInput.value,
    password: passwordInput.value
  };

  updateButton.addEventListener('click', function(event) {
    event.preventDefault(); 
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
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

      // Later, when the form is submitted...
      var updatedData = {
        _id: idInput.value, // Always include _id
      };

if (nameInput.value !== originalData.username) updatedData.username = nameInput.value;
if (emailInput.value !== originalData.email) updatedData.email = emailInput.value;
if (idInput.value !== originalData._id) updatedData._id = idInput.value;
if (passwordInput.value !== originalData.password && passwordInput.value !== '') updatedData.password = passwordInput.value;
        fetch('http://localhost:3000/api/adminfacupdate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
            body: JSON.stringify(updatedData),
        
        })
        .then(response => response.json())
        .then(data => {
          showAlert('success', 'Success!', 'Update successful!');
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
    });
  });

  return {editForm, overlay2};
}
//----------------------------------------------------------------
function populateFacContainer() {
  var faccontainer = document.querySelector('.faccontainer');
  
    // Fetch the students data from the server
    fetch('http://localhost:3000/api/adminfacultyget')
      .then(response => response.json())
      .then(result => {
        var faculty = result.data; // Access the data property
        
        // Check if there are any students
        if (faculty.length === 0) {
          var noFacultysLabel = document.createElement('p');
          noFacultysLabel.textContent = 'No faculty';
          faccontainer.appendChild(noFacultysLabel);
        } else {
          // Create list items for each student
          for (var i = 0; i < faculty.length; i++) {
            var faclistItem = createListItemfac(faculty[i], i);
            faccontainer.appendChild(faclistItem);
          }
        }
      })
      .catch(error => console.error('Error:', error));
  }


// Call the function to populate the student container
populateFacContainer();
//---------------------------------------------------------------------------------
//2.Item Container
//2.b listed List
  function createListItemnew(data, index) {
    var listItemnew = document.createElement('li');
    listItemnew.className = 'material-list-item-new';
    var sno = document.createElement('span');

    sno.className = 'itmsno';
    sno.textContent = index + 1; // S.No starts from 1
    listItemnew.appendChild(sno);

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
  
    var itemDescriptionnew = document.createElement('span');
    itemDescriptionnew.className = 'item-description-new';
    itemDescriptionnew.textContent = data.description;
    itemContentnew.appendChild(itemDescriptionnew);

    var solidBlocknew = document.createElement('div');
    solidBlocknew.className = 'solid-block-new';
    solidBlocknew.style.backgroundColor = getRandomColor();
    listItemnew.appendChild(solidBlocknew);
  
    var itemButtonnew = document.createElement('button');
    itemButtonnew.className = 'item-button-new';
    itemButtonnew.textContent = 'Edit';
    listItemnew.appendChild(itemButtonnew);
  
    return listItemnew;
  }
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
//-------------------------------------------
var listedcontainer = document.querySelector('.listedcontainer');
fetch('http://localhost:3000/api/listeditems')
  .then(response => response.json())
  .then(data => {
    data.forEach((item,index) => {
      let midpoint = Math.floor(item.questions.length / 2);
  
      if (item.questions.length % 2 !== 0) {
        midpoint++;
      }
      // Divide the questions array into two parts
      const firstHalf = item.questions.slice(0, midpoint).map(q => q.answer).join(' ');
      const secondHalf = item.questions.slice(midpoint).map(q => q.answer).join(', ');

      var listItemnew = createListItemnew({
        icon: item.iconName,
        title: item.title,
        category: item.category,
        description: `${firstHalf}...${secondHalf}`,
        itemId:item.itemId
      },index);
       // Append the list to the body or another container
    listedcontainer.appendChild(listItemnew);
   
//-------------------------------------------------------------------------------
listItemnew.querySelector('.item-button-new').addEventListener('click', function() {
    
  // Create overlay
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);

  // Create form and input fields
  var form = document.createElement('form');
  form.className = 'form-container';
  form.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" value="${item.title}">
      </div>
      <div class="form-group">
        <label for="iconName">Icon Name</label>
        <input type="text" id="iconName" value="${item.iconName}">
      </div>
    </div>
    <div class="form-group">
      <label for="category">Category</label>
      <input type="text" id="category" value="${item.category}">
    </div>`;
   
// Add dynamic fields for questions
item.questions.forEach((q, index) => {
  form.innerHTML += `
    <div class="form-group form-group-question">
      <div>
        <label for="question${index}">Question ${index + 1}</label>
        <input type="text" id="question${index}" value="${q.question}">
      </div>
      <div>
        <label for="answer${index}">Answer ${index + 1}</label>
        <input type="text" id="answer${index}" value="${q.answer}">
      </div>
    </div>
  `;
});

// Add dynamic fields for verification questions
item.verificationQuest.forEach((q, index) => {
  form.innerHTML += `
    <div class="form-group form-group-question">
      <div>
        <label for="verificationQuestion${index}">Verification Question ${index + 1}</label>
        <input type="text" id="verificationQuestion${index}" value="${q.question}">
      </div>
      <div>
        <label for="verificationAnswer${index}">Verification Answer ${index + 1}</label>
        <input type="text" id="verificationAnswer${index}" value="${q.answer}">
      </div>
    </div>
  `;
});

form.innerHTML += `
    <div class="form-group">
      <label for="itemId">Item ID</label>
      <input type="text" id="itemId" value="${item.itemId}" disabled>
    </div>
    <div class="form-group">
      <label for="userId">User ID</label>
      <input type="text" id="userId" value="${item.userId}" disabled>
    </div>
    <div class="form-group">
      <label for="usertype">User Type</label>
      <input type="text" id="usertype" value="${item.usertype}" disabled>
    </div>
    `;

  // Add buttons
form.innerHTML += `
  <div class="form-buttons">
    <button type="button" class="delete-button">Delete</button>
    <button type="button" class="update-button">Update</button>
    <button type="button" class="close-button">Close</button>
  </div>
`;
  overlay.appendChild(form);  // Add event listeners to buttons
  form.querySelector('.delete-button').addEventListener('click', function() {
    // Delete item
  

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to delete this item?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
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
fetch(`http://localhost:3000/api/admindellistitems/${item.itemId}`, {
method: 'DELETE',
})
.then(response => response.json())
.then(data => {
if (data.success) {
  showAlert('success', 'Success!', 'Deletion successful!');
  listItemnew.remove();
} else {
  console.error('Error:', data.error);
}
})
.catch((error) => {
console.error('Error:', error);
});
}
});
});
//------------------------------------------------------------------------
form.querySelector('.update-button').addEventListener('click', function() {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to update this item?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
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
      // Gather updated values
      const updatedValues = {
        title: form.querySelector('#title').value,
        iconName: form.querySelector('#iconName').value,
        category: form.querySelector('#category').value,
        questions: item.questions.map((q, index) => ({
          question: form.querySelector(`#question${index}`).value,
          answer: form.querySelector(`#answer${index}`).value
        })),
        verificationQuest: item.verificationQuest.map((q, index) => ({
          question: form.querySelector(`#verificationQuestion${index}`).value,
          answer: form.querySelector(`#verificationAnswer${index}`).value
        })),
        itemId: item.itemId,
        userId: item.userId,
        usertype: item.usertype
      };

      // Make PUT request to update item
      fetch(`http://localhost:3000/api/adminupdatelisteditems/${item.itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedValues),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showAlert('success', 'Success!', 'Update successful!');
          overlay.style.display = 'none';
       
        } else {
          console.error('Error:', data.error);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  });
});

//------------------------------------------------------------------------
form.querySelector('.close-button').addEventListener('click', function() {
// Close form
overlay.style.display = 'none';
});
});
})
})


//----------------------------------------------------------------
              /*2*/
//---------------------------------------------------------------------------------
//2.Item Container
//2.b requested List
function createListItemnewreq(data, index) {
  var listItemnewreq = document.createElement('li');
  listItemnewreq.className = 'material-list-item-new';
  var sno = document.createElement('span');

  sno.className = 'itmsno';
  sno.textContent = index + 1; // S.No starts from 1
  listItemnewreq.appendChild(sno);

  var iconnew = document.createElement('i');
  iconnew.className = 'material-icons';
  iconnew.textContent = data.icon;
  listItemnewreq.appendChild(iconnew);

  var itemContentnew = document.createElement('div');
  itemContentnew.className = 'item-content-new';
  listItemnewreq.appendChild(itemContentnew);

  var itemTitlenew = document.createElement('span');
  itemTitlenew.className = 'item-title-new';
  itemTitlenew.textContent = data.title;
  itemContentnew.appendChild(itemTitlenew);

  var itemCategorynew = document.createElement('span');
  itemCategorynew.className = 'item-category-new';
  itemCategorynew.textContent = data.category;
  itemContentnew.appendChild(itemCategorynew);

  var itemDescriptionnew = document.createElement('span');
  itemDescriptionnew.className = 'item-description-new';
  itemDescriptionnew.textContent = data.description;
  itemContentnew.appendChild(itemDescriptionnew);

  var solidBlocknew = document.createElement('div');
  solidBlocknew.className = 'solid-block-new';
  solidBlocknew.style.backgroundColor = getRandomColor();
  listItemnewreq.appendChild(solidBlocknew);

  var itemButtonnew = document.createElement('button');
  itemButtonnew.className = 'item-button-newreq';
  itemButtonnew.textContent = 'Edit';
  listItemnewreq.appendChild(itemButtonnew);

  return listItemnewreq;
}

//-------------------------------------------
var requestedcontainer = document.querySelector('.requestedcontainer');
fetch('http://localhost:3000/api/requesteditems')
.then(response => response.json())
.then(data => {
  data.forEach((item,index) => {
    let midpoint = Math.floor(item.questions.length / 2);

    if (item.questions.length % 2 !== 0) {
      midpoint++;
    }
    // Divide the questions array into two parts
    const firstHalf = item.questions.slice(0, midpoint).map(q => q.answer).join(' ');
    const secondHalf = item.questions.slice(midpoint).map(q => q.answer).join(', ');

    var listItemnewreq = createListItemnewreq({
      icon: item.iconName,
      title: item.title,
      category: item.category,
      description: `${firstHalf}...${secondHalf}`,
      itemId:item.itemId
    },index);
     // Append the list to the body or another container
  requestedcontainer.appendChild(listItemnewreq);
 
//-------------------------------------------------------------------------------
listItemnewreq.querySelector('.item-button-newreq').addEventListener('click', function() {


  // Create overlay
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);

  // Create form and input fields
  var form = document.createElement('form');
  form.className = 'form-container';
  form.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" value="${item.title}">
      </div>
      <div class="form-group">
        <label for="iconName">Icon Name</label>
        <input type="text" id="iconName" value="${item.iconName}">
      </div>
    </div>
    <div class="form-group">
      <label for="category">Category</label>
      <input type="text" id="category" value="${item.category}">
    </div>`;
   
// Add dynamic fields for questions
item.questions.forEach((q, index) => {
  form.innerHTML += `
    <div class="form-group form-group-question">
      <div>
        <label for="question${index}">Question ${index + 1}</label>
        <input type="text" id="question${index}" value="${q.question}">
      </div>
      <div>
        <label for="answer${index}">Answer ${index + 1}</label>
        <input type="text" id="answer${index}" value="${q.answer}">
      </div>
    </div>
  `;
});

// Add dynamic fields for verification questions
item.verificationQuest.forEach((q, index) => {
  form.innerHTML += `
    <div class="form-group form-group-question">
      <div>
        <label for="verificationQuestion${index}">Verification Question ${index + 1}</label>
        <input type="text" id="verificationQuestion${index}" value="${q.question}">
      </div>
      <div>
        <label for="verificationAnswer${index}">Verification Answer ${index + 1}</label>
        <input type="text" id="verificationAnswer${index}" value="${q.answer}">
      </div>
    </div>
  `;
});

form.innerHTML += `
    <div class="form-group">
      <label for="itemId">Item ID</label>
      <input type="text" id="itemId" value="${item.itemId}" disabled>
    </div>
    <div class="form-group">
      <label for="userId">User ID</label>
      <input type="text" id="userId" value="${item.userId}" disabled>
    </div>
    <div class="form-group">
      <label for="usertype">User Type</label>
      <input type="text" id="usertype" value="${item.usertype}" disabled>
    </div>
    `;

  // Add buttons
form.innerHTML += `
  <div class="form-buttons">
    <button type="button" class="delete-button">Delete</button>
    <button type="button" class="update-button">Update</button>
    <button type="button" class="close-button">Close</button>
  </div>
`;
  overlay.appendChild(form);  // Add event listeners to buttons
  form.querySelector('.delete-button').addEventListener('click', function() {
    // Delete item
  

Swal.fire({
  title: 'Are you sure?',
  text: 'Do you want to delete this item?',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes',
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
fetch(`http://localhost:3000/api/admindelreqitems/${item.itemId}`, {
method: 'DELETE',
})
.then(response => response.json())
.then(data => {
if (data.success) {
showAlert('success', 'Success!', 'Deletion successful!');
overlay.style.display = 'none';
listItemnewreq.remove();
} else {
console.error('Error:', data.error);
}
})
.catch((error) => {
  console.error('Error:', error);
});
}
});
});
//------------------------------------------------------------------------
  form.querySelector('.update-button').addEventListener('click', function() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
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
        // Gather updated values
        const updatedValues = {
          title: form.querySelector('#title').value,
          iconName: form.querySelector('#iconName').value,
          category: form.querySelector('#category').value,
          questions: item.questions.map((q, index) => ({
            question: form.querySelector(`#question${index}`).value,
            answer: form.querySelector(`#answer${index}`).value
          })),
          verificationQuest: item.verificationQuest.map((q, index) => ({
            question: form.querySelector(`#verificationQuestion${index}`).value,
            answer: form.querySelector(`#verificationAnswer${index}`).value
          })),
          itemId: item.itemId,
          userId: item.userId,
          usertype: item.usertype
        };
  
        // Make PUT request to update item
        fetch(`http://localhost:3000/api/adminupdaterequesteditems/${item.itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedValues),
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            showAlert('success', 'Success!', 'Update successful!');
            overlay.style.display = 'none';
            // Update the list item in the UI...
          } else {
            console.error('Error:', data.error);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
    });
  });
  
//------------------------------------------------------------------------
form.querySelector('.close-button').addEventListener('click', function() {
  // Close form
  overlay.style.display = 'none';
});
});
  })
})

//---------------------------------------------------------------------------------
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
//---------------------------------------------------------------------------------
});