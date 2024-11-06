let currentOwnerUser = null;
let currentEndUser = null;
let messagesByItem = {};
var currentItemId;
window.onload = function() {
    // Get the itemtitle from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const topic = decodeURIComponent(urlParams.get('topic'));

    let ruserId = localStorage.getItem('ruserId'); 
    fetch(`http://localhost:3000/p2p?userId=${ruserId}`)
    .then(response => response.json())
    .then(data => {
      // Loop through the data and create a list for each item
      data.forEach((item, index) => {
        messagesByItem[item.itemtitle] = item.messages.map(message => ({
            ...message,
            sender: (message.userType === 'ownerUser' && item.ownerUser === ruserId) || 
                    (message.userType === 'endUser' && item.endUser === ruserId),
        }));
       
        // Create a list item for the sidebar for each item
        let listItem = document.createElement('li');
        listItem.textContent = item.itemtitle;
        listItem.className= 'listItem';

        // Store the itemId as a data attribute on the list item
    listItem.dataset.itemId = item.itemId;
       
        listItem.addEventListener('click', function() {
            document.getElementById('itemtitle').textContent = item.itemtitle;
            // Compare ruserId with ownerUser and endUser, and set userType accordingly
            if (item.ownerUser === ruserId) {
                localStorage.setItem('chatuserType', 'ownerUser');
                currentOwnerUser = item.ownerUser;
                currentEndUser = item.endUser;
            } else if (item.endUser === ruserId) {
                localStorage.setItem('chatuserType','endUser');
                currentOwnerUser = item.ownerUser;
                currentEndUser = item.endUser;
            }
            // Load the messages for the selected item
            loadMessages(messagesByItem[item.itemtitle]);

             // Get the itemId of the clicked list item
        var itemId = this.dataset.itemId;
        console.log('Selected item ID:', itemId);
          // Store the itemId in the global variable
    currentItemId = itemId;
        });
        document.getElementById('sidebar').appendChild(listItem);

        // If the current item's title matches the topic from the URL, trigger a click event on the list item
        if (item.itemtitle === topic) {
            listItem.click();
        }
      });
    })
    .catch(error => console.error('Error:', error));
}
//-------------------------------------------------------------------------------------------------
function loadMessages(messages) {
    // Clear the current messages
    var chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
   
    // Add the messages for the selected item
    messages.forEach(message => {
        var messageDiv = document.createElement('div');
        messageDiv.classList.add('message');

          
        
        // Add class based on whether the message was sent or received
        if (message.sender) {
            messageDiv.classList.add('sent');
        } else {
            messageDiv.classList.add('received');
        }
    
        // Check user type and add corresponding class
        var userType = localStorage.getItem('chatuserType');
        if (userType === 'endUser') {
            messageDiv.classList.add('enduser-message');
        } else if (userType === 'ownerUser') {
            messageDiv.classList.add('owneruser-message');
        }

        var text = document.createElement('p');
        text.textContent = message.message;
        messageDiv.appendChild(text);

        var timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        timestamp.textContent = new Date(message.datetime).toLocaleString();
        messageDiv.appendChild(timestamp);

        chatMessages.appendChild(messageDiv);
    });
}
document.getElementById('send-button').addEventListener('click', function() {
    var input = document.getElementById('message-input');
    var messages = document.getElementById('chat-messages');

    if(input.value.trim() !== '') {
        var message = document.createElement('div');
     
// In the send-button click event listener, add the new message to the object
if(input.value.trim() !== '') {
    // ...
    messagesByItem[document.getElementById('itemtitle').textContent].push({
        message: input.value,
        datetime: new Date().toISOString(),
    });
    message.classList.add('sent');
          // Check user type and add corresponding class
          var userType = localStorage.getItem('chatuserType');
          console.log('User type:', userType);
          if (userType === 'endUser') {
              message.classList.add('enduser-message');
          } else if (userType === 'ownerUser') {
              message.classList.add('owneruser-message');
          }
          message.classList.add('message');
          
        var text = document.createElement('p');
        text.textContent = input.value;
        message.appendChild(text);

        var timestamp = document.createElement('span');
        timestamp.classList.add('timestamp');
        var date = new Date();
        timestamp.textContent = date.toLocaleString();
        message.appendChild(timestamp);

        messages.appendChild(message);
          // After adding the new message to the messages container
          messages.scrollTop = messages.scrollHeight;
        //-----------------------------------------------------
        
        // Add the message to the database
        var ruserId = localStorage.getItem('ruserId');
        var messageText = input.value;
        var datetime = new Date().toISOString();
        fetch('http://localhost:3000/addmsgp2p', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ownerUser: currentOwnerUser,
                endUser: currentEndUser,
                userId: ruserId,
                userType: userType,
                message: messageText,
                datetime: datetime,
            }),
        })
    
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch((error) => console.error('Error:', error));
        input.value = '';
    }
}
});
//--------------------------------------------------------------

//--------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
document.querySelectorAll('.dropdown-toggle').forEach(function(dropdownToggle) {
    dropdownToggle.addEventListener('click', function() {
        this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none';
    });
});

window.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown-toggle')) {
        document.querySelectorAll('.dropdown-menu').forEach(function(dropdownMenu) {
            dropdownMenu.style.display = 'none';
        });
    }
});

document.getElementById('user-icon').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
});

document.addEventListener('click', function(event) {
    var isClickInside = document.getElementById('sidebar').contains(event.target);
    var isClickOnIcon = document.getElementById('user-icon').contains(event.target);

    if (!isClickInside && !isClickOnIcon && document.getElementById('sidebar').classList.contains('open')) {
        document.getElementById('sidebar').classList.remove('open');
    }
});
//---------------------------------------------------------------------------------
// Get the dropdown items by their IDs
var acceptedItem = document.getElementById('accepted');

// Add click event listener to the "Accepted" item
acceptedItem.addEventListener('click', function(event) {
    event.preventDefault();

    // Get the itemId of the clicked list item
    var itemId = currentItemId;
    

    showConfirmationDialogAndDeleteItem(itemId);
});

function showConfirmationDialogAndDeleteItem(itemId) {
    Swal.fire({
        title: 'Accept?',
        text: 'Do You Want to Set it as accepted?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: ' Yes',
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
          /*  var userId = localStorage.getItem('ruserId');*/
            // If the user confirmed, send a fetch request to delete the item from the database
            fetch('http://localhost:3000/deleteacceptchatItem', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    itemId: itemId,
                   /* userId : userId*/
                })
            })
            .then(response => response.json())
            .then(data => {
                // Handle the response from the server
                console.log(data);
            })
            .catch(error => console.error('Error:', error));
        }
    });
}
//----------------------------------------------------------------------------------
//for close chat delete p2p and claim

var closeChatItem = document.getElementById('close-chat');
// Add click event listener to the "Close Chat" item
closeChatItem.addEventListener('click', function(event) {
    event.preventDefault();

    // Get the itemId of the clicked list item
    var itemId = currentItemId;

    showCloseChatConfirmationDialogAndDeleteItem(itemId);
});

function showCloseChatConfirmationDialogAndDeleteItem(itemId) {
    Swal.fire({
        title: 'Close Chat?',
        text: 'Do You Want to Close this Chat?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: ' Yes',
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
            // If the user confirmed, send a fetch request to delete the item from the database
            fetch('http://localhost:3000/deleteCloseChatItem', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    itemId: itemId,
                })
            })
            .then(response => response.json())
            .then(data => {
                // Handle the response from the server
                console.log(data);
            })
            .catch(error => console.error('Error:', error));
        }
    });
}
