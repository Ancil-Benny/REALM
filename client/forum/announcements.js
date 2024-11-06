// client.js
window.addEventListener('load', async function() {
  try {
    const response = await fetch('http://localhost:3000/getAnnouncements');

    if (!response.ok) {
      throw new Error(`Network response not ok: ${response.status}`);
    }

    const announcements = await response.json();

    // Create a list item for each announcement and append it to the container
    var ancontainer = document.querySelector('.ancon');
    announcements.forEach(function(announcement) {
      var listItem = createListItem(announcement);
      ancontainer.appendChild(listItem);
    });
  } catch (error) {
    console.error(`Fetch operation failed: ${error.message}`);
  }
});
//--------------------------------------------------------------
// Get the current date and time
function getCurrentDateTime() {
  var currentdate = new Date(); 
  var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + "  "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                
  return datetime;
}
//------------------------------------------------------------------

function createListItem(data) {
    var listItem = document.createElement('li');
    listItem.className = 'material-list-item';
  
    var itemdate = document.createElement('div');
    itemdate.className = 'item-date';
    itemdate.textContent = data.date;
    listItem.appendChild(itemdate);

   
  
    var itemContent = document.createElement('div');
    itemContent.className = 'item-content';
    listItem.appendChild(itemContent);
  
    var itemTitle = document.createElement('span');
    itemTitle.className = 'item-title';
    itemTitle.textContent = data.title;
    itemContent.appendChild(itemTitle);
  
    var solidBlock = document.createElement('div');
    solidBlock.className = 'solid-block';
    solidBlock.style.backgroundColor = '#f3b351';
    listItem.appendChild(solidBlock);
  

    var itemDescription = document.createElement('span');
    itemDescription.className = 'item-description';
    itemDescription.textContent = data.description; 
    itemContent.appendChild(itemDescription);
  
    return listItem;
  }

 

  document.getElementById('sendButton').addEventListener('click', async function() {
  // Get the user name from local storage
  var userType = localStorage.getItem('rusername');

  // Get the content from the input field
  var inputContent = document.getElementById('chatInput').value;

  // Avoid empty content
  if (inputContent.trim() === '') {
    alert('Please enter a message.');
    return;
  }

  // Create a new data object
  var newData = {
    title: userType,
    date: getCurrentDateTime(),
    description: inputContent,
    userType: localStorage.getItem('rusertype'),
    userId: localStorage.getItem('ruserId')
  };
//--------------------------------------------------------------------
 // Send a POST request to the server
 try {
  const response = await fetch('http://localhost:3000/addAnnouncement', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newData)
  });

  if (!response.ok) {
    throw new Error(`Network response not ok: ${response.status}`);
  }

  const result = await response.json();
  console.log(result);
} catch (error) {
  console.error(`Fetch operation failed: ${error.message}`);
}

//------------------------------------------------------------------
  // Create a new list item with the new data
  var newListItem = createListItem(newData);

  // Append the new list item to the container
  var ancontainer = document.querySelector('.ancon');
  ancontainer.appendChild(newListItem);

  // Clear the input field
  document.getElementById('chatInput').value = '';
//----------------------------------


});
//--------------input for announcement--------------------------------
document.getElementById('fab').addEventListener('click', function() {
  var chatInputContainer = document.getElementById('chatInputContainer');
  if (chatInputContainer.style.display !== 'flex') {
    chatInputContainer.style.display = 'flex';
  } else {
    chatInputContainer.style.display = 'none';
  }
});