var username = localStorage.getItem('rusername');
var userId = localStorage.getItem('ruserId');
var userType = localStorage.getItem('rusertype');
var selectedTopic = null;
var selectedTopicId;
window.onload = async function() {
    const response = await fetch('http://localhost:3000/topics');
    const topics = await response.json();

    var right = document.querySelector('.right');
    var main = document.getElementById('main');

    topics.forEach((topic, index) => {
        var topicDiv = document.createElement('div');
        topicDiv.className = 'topic';
        topicDiv.textContent = topic.topicName;
        topicDiv.setAttribute('data-topic-id', topic.topicId);

        topicDiv.addEventListener('click', function() {
            selectedTopic = topic.topicName;
            selectedTopicId = topic.topicId;
            document.querySelectorAll('.topic').forEach(function(topicDiv) {
                topicDiv.classList.remove('selected');
            });
            topicDiv.classList.add('selected');
            var topicDisplay = document.getElementById('topic-display');
            topicDisplay.textContent = 'Topic: ' + selectedTopic;
            topicDisplay.style.display = 'inline';
            document.querySelectorAll('.message').forEach(function(messageDiv) {
                messageDiv.style.display = messageDiv.getAttribute('data-topic') === topic.topicName ? 'block' : 'none';
            });
        });

        right.appendChild(topicDiv);

        topic.messages.forEach(message => {
            var messageDiv = document.createElement('div');
            
            messageDiv.className = 'message';
            messageDiv.setAttribute('data-topic', topic.topicName);
            messageDiv.id = message._id;
            messageDiv.innerHTML = `
                     <!-- <div class="name">${message.username}</div>-->
                     <div class="name ${message.userType}">${message.username}</div>
                <div class="date">${new Date(message.dateTime).toLocaleString()}</div>
                <div class="text">${message.message}</div>
                <div class="votes">
                    <i class='bx bx-upvote upvote'></i>
                    <span class="count">${message.upvote || 0}</span>
                    <i class='bx bx-downvote downvote'></i>
                    <span class="count">${message.downvote || 0}</span>
                    <i class='bx bx-comment comment'></i>
                </div>
            `;

            // Create a hidden comment section for each message
            var commentSection = document.createElement('div');
            commentSection.className = 'comment-section';
            commentSection.style.display = 'none'; // Initially hidden
            commentSection.innerHTML = `
                <input type="text" class="comment-input" placeholder="Your comment">
                <button class="add-comment">Add</button>
            `;

        
// Add existing comments
if (Array.isArray(message.comments)) {
    message.comments.forEach(comment => {
        var commentContainer = document.createElement('div');
        commentContainer.className = 'comment';
        commentContainer.innerHTML = `
                   <!--<div class="user">${comment.username}</div> -->
            <div class="user ${comment.userType}">${comment.username}</div>
            <div class="date">${new Date(comment.dateTime).toLocaleString()}</div>
            <div class="text">${comment.message}</div>
        `;
        commentSection.appendChild(commentContainer);
    });
}

messageDiv.appendChild(commentSection);



// Add an event listener to the 'Add' button in the comment section
commentSection.querySelector('.add-comment').addEventListener('click', function() {
    var commentInput = this.previousElementSibling;
    var commentText = commentInput.value;
    var comment = commentText; // comment is now a string, not an object

    var commentContainer = document.createElement('div');
    commentContainer.className = 'comment';
    commentContainer.innerHTML = `
                 <!-- <div class="user">${username}</div>  -->
                 <div class="user ${userType}">${username}</div>     
    <div class="date">${new Date().toLocaleString()}</div>
    <div class="text">${comment}</div>
`;
    // Insert the new comment at the beginning of the comment section
    commentSection.insertBefore(commentContainer, commentInput.parentElement.nextSibling);
    commentInput.value = '';
    
sendCommentToServer(selectedTopicId, message._id, commentText, username, userType, userId);
});

// Add an event listener to the message div to toggle the visibility of the comment section
messageDiv.querySelector('.comment').addEventListener('click', function() {
    commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
});

// Stop propagation of click event in the comment section
commentSection.addEventListener('click', function(event) {
    event.stopPropagation();
});

main.appendChild(messageDiv);
attachVoteListeners(messageDiv);
if (index === 0) {
    topicDiv.click();
}
        });
    });
}
//--------------------------------------------------------------
// Section: Voting

function attachVoteListeners(messageDiv) {
    messageDiv.userVote = null;
    // Increase vote count when upvote or downvote is clicked
    messageDiv.querySelector('.upvote').addEventListener('click', async function() {
        if (messageDiv.userVote) {
            return;
        }
        var count = messageDiv.querySelector('.upvote + .count');
        count.textContent = parseInt(count.textContent) + 1;
        messageDiv.userVote = 'upvote';
    
        // Send the updated vote count to the server
        const response = await fetch('http://localhost:3000/updateVote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topicId: selectedTopicId, messageId: messageDiv.id, upvote: parseInt(count.textContent) })
        });
    });
    
    messageDiv.querySelector('.downvote').addEventListener('click', async function() {
        if (messageDiv.userVote) {
            return;
        }
        var count = messageDiv.querySelector('.downvote + .count');
        count.textContent = parseInt(count.textContent) + 1;
        messageDiv.userVote = 'downvote';
    
        // Send the updated vote count to the server
        const response = await fetch('http://localhost:3000/updateVote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ topicId: selectedTopicId, messageId: messageDiv.id, downvote: parseInt(count.textContent) })
        });
    });
}
//-----------------------------------------------------------------------
//comment fn
async function sendCommentToServer(topicId, messageId, comment, username, userType, userId) {
    const response = await fetch('http://localhost:3000/addComment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            topicId: topicId,
            messageId: messageId,
            comment: comment,
            username: username,
            userType: userType, 
            userId: userId 
        })
    });
    
    const data = await response.json();
    
    if (data.success) {
        console.log('Comment updated successfully');
    } else {
        console.error('Failed to update comment:', data.message);
    }
}
//--------------------------------------------------------------------
// Initialize selected topic
let messageId;


// Section: Topic addition
// Show input and button for adding a new topic when 'add-topic' is clicked
document.getElementById('add-topic').addEventListener('click', function() {
    document.getElementById('topic-input').style.display = 'block';
    document.getElementById('add-button').style.display = 'block';
});

// Add a new topic when 'add-button' is clicked
document.getElementById('add-button').addEventListener('click', function() {
    var topic = document.getElementById('topic-input').value;
    var topicId = uuid.v4();
    
    var right = document.querySelector('.right');
    var div = document.createElement('div');
    div.className = 'topic';
    div.textContent = topic;
    div.setAttribute('data-topic-id', topicId);

       // Add the div to the DOM
       right.appendChild(div);

    // Section: Topic selection
    // Set selected topic and update UI when a topic is clicked
    div.addEventListener('click', function() {
        selectedTopic = topic;
        selectedTopicId = div.getAttribute('data-topic-id'); // Store the selected topic ID
        console.log('Topic selected with id:', selectedTopicId);
        document.querySelectorAll('.topic').forEach(function(topicDiv) {
            topicDiv.classList.remove('selected');
        });
        console.log('selectedTopicId after topic selection:', selectedTopicId);
        div.classList.add('selected');
        var topicDisplay = document.getElementById('topic-display');
        topicDisplay.textContent = 'Topic: ' + selectedTopic;
        topicDisplay.style.display = 'inline'; // Make the topic display visible
        document.querySelectorAll('.message').forEach(function(messageDiv) {
            messageDiv.style.display = messageDiv.getAttribute('data-topic') === topic ? 'block' : 'none';
        });
    });

    right.appendChild(div);
    document.getElementById('topic-input').style.display = 'none';
    document.getElementById('add-button').style.display = 'none';
});

// Section: Message sending
// Send a message when 'send' is clicked
document.getElementById('send').addEventListener('click', async function() {
    var message = document.getElementById('message').value;
      // Check if message is not empty
      if (!message) {
        console.error('Message is required');
        return;
    }
    if (!selectedTopicId) {
        console.error('A topic must be selected before sending a message');
        return;
    }
    var main = document.getElementById('main');
    var div = document.createElement('div');
    div.className = 'message';
    div.setAttribute('data-topic', selectedTopic);

   

    div.innerHTML = `
        <div class="name">${username}</div>
        <div class="date">${new Date().toLocaleString()}</div>
        <div class="text">${message}</div>
        <div class="votes">
            <i class='bx bx-upvote upvote'></i>
            <span class="count">0</span>
            <i class='bx bx-downvote downvote'></i>
            <span class="count">0</span>
            <i class='bx bx-comment comment'></i>
        </div>
    `;


    
    main.appendChild(div);
    attachVoteListeners(div);
    main.offsetHeight; // Force a reflow (re-render)
    document.querySelectorAll('.message').forEach(function(messageDiv) {
        messageDiv.style.display = messageDiv.getAttribute('data-topic') === selectedTopic ? 'block' : 'none';
    });
    document.getElementById('message').value = '';

    // Section: Commenting
    // Create a hidden comment section for each message
    var commentSection = document.createElement('div');
    commentSection.className = 'comment-section';
    commentSection.style.display = 'none'; // Initially hidden
    commentSection.innerHTML = `
        <input type="text" class="comment-input" placeholder="Your comment">
        <button class="add-comment">Add</button>
    `;
    div.appendChild(commentSection);

    // Toggle visibility of comment section when comment icon is clicked
    div.querySelector('.comment').addEventListener('click', function() {
        commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';

    });
    //-------------------------------------------------------------------------
    var topicDisplay = document.getElementById('topic-display').innerText;


  


 // Check if username is not null
if (!username) {
    console.error('Username is not set in local storage');
    return;
}
 

    // Send the new forum post to the server
    const forumPost = {
        topicName:selectedTopic,
       topicId: selectedTopicId,
        userId: userId,
        userType: userType,
        username: username,
        message: message,
        upvote: 0,
        downvote: 0,
        comments: [] // Replace with actual comments if any
    };

    const response = await fetch('http://localhost:3000/addforum', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(forumPost)
    });

    const data = await response.json();
    console.log(data.message);
console.log(data.messageId);
messageId = data.messageId;
    // Clear the message input field
    document.getElementById('message').value = '';


//---------------------------------------------------------------
// Section: Comment addition
document.body.addEventListener('click', async function(event) {
    if (event.target.className === 'add-comment') {
        var commentInput = event.target.parentElement.querySelector('.comment-input');
        var comment = commentInput.value;

        var commentContainer = document.createElement('div');
        commentContainer.className = 'comment';
        commentContainer.innerHTML = `
            <div class="user">${username}</div>
            <div class="date">${new Date().toLocaleString()}</div>
            <div class="text">${comment}</div>
        `;
        // Append the new comment to the comment section
        event.target.parentElement.insertBefore(commentContainer, commentInput.parentElement.firstChild);
        commentInput.value = '';

// In add-comment click event listener
sendCommentToServer(selectedTopicId, messageId, comment, username, userType, userId);

    //-----------------------------------------
    }
});

});