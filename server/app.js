const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const multer = require('multer');

//nlp
const natural = require('natural');



const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) 
  }
})

const upload = multer({ storage: storage })


const Student = require('./models/student'); 
const stdrequestItem = require('./models/newreqItem');
const Admin = require('./models/admin');
const stddelcard= require('./models/newreqItem.js'); 
const Faculty= require('./models/faculty.js');
const AddItem = require('./models/Additem'); 
const ListedItem = require('./models/listeditem');
const NewreqItem = require('./models/newreqItem');
const reqItems = require('./models/newreqItem');
const ClaimList = require('./models/ClaimList');
const Topic = require('./models/topic');
const Announcement = require('./models/announcement');
const P2P = require('./models/p2p');
const Raiseticket = require('./models/raiseticket');
//--------------------------------------------------------------
const port = process.env.PORT || 3000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
dotenv.config();

mongoose.connect('mongodb://localhost:27017/realm', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

//-------------------------------------------------------
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
//---------------------------------------------------
app.use(express.json());


//--------------------------------------------------------------------------------
app.post('/studentlogin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email, password });
    if (student) {
      if (student.verify) {
        res.json({ success: true, userId: student._id, username: student.username });
      } else {
        res.json({ success: false, error: 'Verification still undergoing. Please wait.' });
      }
    } else {
      res.json({ success: false, error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});
//-----------------------------------------------------------------------------
//student sign up
app.post('/studentsignup', upload.single('idImage'), async (req, res) => {
  try {
    const { ktuid, username, department, email, password } = req.body;
    const idImage = req.file.path;
    if (!ktuid || !username || !department || !email || !password || !idImage) {
      throw new Error('All fields are required');
    }

    const existingStudent = await Student.findOne({ $or: [{ email }, { ktuid }] });
    if (existingStudent) {
      if (existingStudent.email === email) {
        throw new Error('A student with this email already exists.');
      } else {
        throw new Error('A student with this KTU ID already exists.');
      }
    }

    const newStudent = new Student({ ktuid, username, department, email, password, idImage });

    await newStudent.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});
//-----------------------------------------------------------------------------
//admin login
app.post('/adminlogin', async (req, res) => {
  try {
    const { admemail, admpassword } = req.body;

    const admin = await Admin.findOne({ admemail, admpassword });
    if (admin) {
      res.json({ success: true, adminId: admin._id, username: admin.admname });
    } else {
      res.json({ success: false, error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
//-----------------------------------------------------------------------------
//admin sign up
app.post('/adminsignup', async (req, res) => {
  try {
    const { admid, admname, admemail, admpassword } = req.body;
    if (!admid || !admname || !admemail || !admpassword ) {
      throw new Error('All fields are required');
    }

    const existingAdmin = await Admin.findOne({ $or: [{ admemail }, { admid }] });
    if (existingAdmin) {
      if (existingAdmin.admemail === admemail) {
        throw new Error('A Admin with this email already exists.');
      } else {
        throw new Error('A Admin with this ID already exists.');
      }
    }

    const newAdmin = new Admin({ admid, admname, admemail, admpassword });

    await newAdmin.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});

//--------------------------------------------------------------------------------
//faculty login
app.post('/facultylogin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const faculty = await Faculty.findOne({ email, password });
    if (faculty) {
      res.json({ success: true, facultyId: faculty._id, username: faculty.username });
    } else {
      res.json({ success: false, error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
//--------------------------------------------------------------------------------
//faculty signup
app.post('/facultysignup', async (req, res) => {
  try {
    const { facid, username, email, password } = req.body;
    if (!facid || !username || !email || !password ) {
      throw new Error('All fields are required');
    }

    const existingFaculty = await Faculty.findOne({ $or: [{ email }, { facid }] });
    if (existingFaculty) {
      if (existingFaculty.email === email) {
        throw new Error('A Faculty with this email already exists.');
      } else {
        throw new Error('A Faculty with this ID already exists.');
      }
    }

    const newFaculty = new Faculty({ facid, username, email, password });

    await newFaculty.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
});
//--------------------------------------------------------------------------------

// <<------take--------|col1 | , ----------put------>>||col2 ||, <<-------take-------||col2 ||  
app.get('/additems', async (req, res) => {
  try {
    const items = await AddItem.find().select('name category icon questions verificationQuest');
    res.json({ success: true, additems: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//--------------------------------------------------------------------------------
//lists list add items
app.post('/addquestsubmit', async (req, res) => {
  const { coltype,title, iconName, category, questions, verificationQuest, itemId, userId, usertype } = req.body;

  const listedItem = new ListedItem({
    coltype,
    title,
    iconName,
    category,
    questions,
    verificationQuest,
    itemId,
    userId,
    usertype
  });

  try {
    await listedItem.save();
    res.status(200).json({ message: 'ListedItem saved successfully' });
  } catch (error) {
    console.warn(error);
    res.status(500).json({ message: 'Error saving ListedItem' });
  }
});
//--------------------------------------------------------------------------------
app.get('/api/listeditems', async (req, res) => {
  try {
    const { userId, usertype } = req.query;
    let listedItems = await ListedItem.find();
    let claimItems = await ClaimList.find({ userId, usertype });

    // Add userMatch property to the items that match the userId and usertype
    listedItems = listedItems.map(item => {
      if (item.userId === userId && item.usertype === usertype) {
        return { ...item._doc, userMatch: true };
      }
      return item;
    });

    // Add itemId, chances, and status to the items that match the userId and usertype
    listedItems = listedItems.map(item => {
      const claimItem = claimItems.find(ci => ci.itemId === item.itemId);
      if (claimItem) {
        return { ...item._doc, itemId: claimItem.itemId, chances: claimItem.chances, status: claimItem.status };
      }
      return item;
    });

    res.status(200).json(listedItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//---------------------------------------------------------------------------
  //lists new add requests
app.post('/newreqsubmit', async (req, res) => {
  const { coltype,title, iconName, category, questions, verificationQuest, itemId, userId, usertype } = req.body;

  const newReqItemInstance  = new NewreqItem ({
    coltype,
    title,
    category,
    iconName,
    questions,
    verificationQuest,
    itemId,
    userId,
    usertype
  });

  try {
    await newReqItemInstance.save();
    res.status(200).json({ message: 'newreqItem saved successfully' });
  } catch (error) {
    console.warn(error);
    res.status(500).json({ message: 'Error saving newrequest' });
  }
});
//---------------------------------------------------------------------------
app.get('/api/reqitems', async (req, res) => {
  try {
    const { userId, usertype } = req.query;
    let requestedItems = await reqItems.find();
    let claimItems = await ClaimList.find({ userId, usertype });

    // Add userMatch property to the items that match the userId and usertype
    requestedItems = requestedItems.map(item => {
      if (item.userId === userId && item.usertype === usertype) {
        return { ...item._doc, userMatch: true };
      }
      return item;
    });

    // Add itemId, chances, and status to the items that match the userId and usertype
    requestedItems = requestedItems.map(item => {
      const claimItem = claimItems.find(ci => ci.itemId === item.itemId);
      if (claimItem) {
        return { ...item._doc, itemId: claimItem.itemId, chances: claimItem.chances, status: claimItem.status };
      }
      return item;
    });

    res.status(200).json(requestedItems);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//---------------------------------------------------------------------------
//(2). student dashboard card retrieval of a particular student from reqItems collection

//lists retrieve requests cards
app.get('/api/studentreqitems', async (req, res) => {
  try {
    let { usertype, userId } = req.query; // get the query parameters
    const studentrequestedItems = await stdrequestItem.find({ usertype, userId }); // filter the data
    res.status(200).json(studentrequestedItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//-------------------------------------------------------------------------------
//delete listed item from listed in dashboard
app.delete('/api/studentdelitems/:id', async (req, res) => {
  try {
    const { id } = req.params; // get the id from the parameters
    const deletedItem = await ListedItem.findByIdAndDelete(id); // delete the item
    if (!deletedItem) {
      return res.status(404).json({ success: false, error: 'No item found with this ID' });
    }
    res.status(200).json({ success: true, data: deletedItem });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: 'An error occurred while deleting the item' });
  }
});
//-------------------------------------------------------------------------------
//(2). student form submission and update:

app.put('/studentupdate/:id', upload.single('profileImage'), async (req, res) => {
  console.log('Request received'); 
  console.log(req.body); 
  const id = req.params.id;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  try {
    const student = await Student.findById(id);

    if (oldPassword !== student.password) {
      return res.status(400).json({ message: 'Old password does not match' });
    }

    const update = {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: newPassword,
      semester: req.body.semester,
      department: req.body.department,
      profileImage: req.file.path
    };

    const updatedStudent = await Student.findByIdAndUpdate(id, update, { new: true });
    res.json(updatedStudent);
  } catch (err) {
    console.error(err); 
    res.status(500).json({ error: err.message });
  }
});
//--------------------------------------------------------------------------
//fetch data to student dashboard

app.get('/api/studentdata/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    const student = await Student.findById(id); 
    if (!student) {
      return res.status(404).json({ success: false, error: 'No student found with this id' });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//--------------------------------------------------------------------------------
//fetch data to faculty dashboard

app.get('/api/facultydata/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    const faculty = await Faculty.findById(id); 
    if (!faculty) {
      return res.status(404).json({ success: false, error: 'No faculty found with this id' });
    }
    res.status(200).json(faculty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//--------------------------------------------------------------------------------
//(2). faculty form submission and update:

app.put('/facultyupdate/:id', upload.single('profileImage'), async (req, res) => {
  console.log('Request received'); 
  console.log(req.body); 
  const id = req.params.id;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  try {
    const faculty = await Faculty.findById(id);

    if (oldPassword !== faculty.password) {
      return res.status(400).json({ message: 'Old password does not match' });
    }

    const update = {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: newPassword,
      semester: req.body.semester,
      department: req.body.department,
      profileImage: req.file.path
    };

    const updatedFaculty = await Faculty.findByIdAndUpdate(id, update, { new: true });
    res.json(updatedFaculty);
  } catch (err) {
    console.error(err); 
    res.status(500).json({ error: err.message });
  }
});
//--------------------------------------------------------------------------
//delete listed item from listed in dashboard
app.delete('/api/facultydelitems/:id', async (req, res) => {
  try {
    const { id } = req.params; // get the id from the parameters
    const deletedItem = await ListedItem.findByIdAndDelete(id); // delete the item
    if (!deletedItem) {
      return res.status(404).json({ success: false, error: 'No item found with this ID' });
    }
    res.status(200).json({ success: true, data: deletedItem });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: 'An error occurred while deleting the item' });
  }
});
//-------------------------------------------------------------------------------
//(2). faculty dashboard card retrieval of a particular student from reqItems collection

//lists retrieve requests cards
app.get('/api/facultyreqitems', async (req, res) => {
  try {
    let { usertype, userId } = req.query; // get the query parameters
    const facultyrequestedItems = await stdrequestItem.find({ usertype, userId }); // filter the data
    res.status(200).json(facultyrequestedItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//-------------------------------------------------------------------------------
//retrival of faculty from listed item db
//lists retrieve cards
app.get('/api/facultyreporteditems', async (req, res) => {
  try {
    let { usertype, userId } = req.query; // get the query parameters
    let facultyreportedItems = await ListedItem.find({ usertype, userId }); // filter the data

    // Map over the items and add claim data if it exists
    const dataWithClaims = await Promise.all(facultyreportedItems.map(async (item) => {
      const claim = await ClaimList.findOne({ itemId: item.itemId }); // check if the item exists in ClaimList
  /*   if (claim) {
        console.log('ClaimList itemId:', claim.itemId); // Log the ClaimList itemId
      }*/
      return {
        listedItem: item,
        claimData: claim || null
      };
    }));

    res.status(200).json(dataWithClaims);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//----------------------------------------------------------------
//nlp listed answer compare

app.post('/api/compare-answers', (req, res) => {
  let { userAnswer, correctAnswer } = req.body;

  // Remove punctuation and convert to lowercase
  userAnswer = userAnswer.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase();
  correctAnswer = correctAnswer.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase();

  const similarity = natural.JaroWinklerDistance(userAnswer, correctAnswer);
  console.log('Similarity:', similarity);
  res.json({ similarity, isSimilar: similarity >= 0.6 });
});
//---------------------------------------------------------------------------
//verification
app.post('/api/store-data', async (req, res) => {
  const {userId, usertype, itemId, chances, dateTime, similarityPercentage, status, question, userAnswer, correctAnswer } = req.body;

  try {
    let claim = await ClaimList.findOne({ userId, itemId, status: 'fail' });

    if (claim) {
      // If a matching document is found, increment chances and update the other fields
      claim = await ClaimList.findOneAndUpdate(
        { userId, itemId, status: 'fail' },
        { $inc: { chances: 1 }, usertype, dateTime, similarityPercentage, status, question, userAnswer, correctAnswer },
        { new: true }
      );
    } else {
      // If no matching document is found, create a new one
      claim = new ClaimList({
        userId,
        usertype,
        itemId,
        chances,
        dateTime,
        similarityPercentage,
        status,
        question,
        userAnswer,
        correctAnswer
      });

      await claim.save();
    }

    res.status(200).json({ message: 'Claim updated successfully', claim });
  } catch (error) {
    console.warn(error);
    res.status(500).json({ message: 'Error updating claim' });
  }
});
//----------------------------------------------------------------
//retrival of student reports from listed item db
//lists retrieve cards
app.get('/api/studentreporteditems', async (req, res) => {
  try {
    let { usertype, userId } = req.query; // get the query parameters
    let studentreportedItems = await ListedItem.find({ usertype, userId }); // filter the data

    // Map over the items and add claim data if it exists
    const dataWithClaims = await Promise.all(studentreportedItems.map(async (item) => {
      const claim = await ClaimList.findOne({ itemId: item.itemId }); // check if the item exists in ClaimList
  /*   if (claim) {
        console.log('ClaimList itemId:', claim.itemId); // Log the ClaimList itemId
      }*/
      return {
        listedItem: item,
        claimData: claim || null
      };
    }));

    res.status(200).json(dataWithClaims);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//----------------------------------------------------------------
app.post('/api/requestsavetop2p', async (req, res) => {
  const { endUser, endUserType, itemId, status } = req.body;
  console.log('Received request:', req.body);

  try {
    // Find the item document with the given itemId in the NewreqItem collection
    const item = await NewreqItem.findOne({ itemId: itemId });
    console.log('Found item:', item); // Log the found item

    if (!item) {
      console.log('Item not found');
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // Create a new document in the P2P collection with the data from the request and the data from the found item document
    const p2p = new P2P({
      itemtitle: item.title,
      ownerUser: item.userId,
      ownerUserType: item.usertype,
      endUser: endUser,
      endUserType: endUserType,
      itemId: itemId,
      status: status,
    });

    await p2p.save();
    console.log('P2P saved:', p2p);

    res.status(200).json({ success: true, data: p2p });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//------------------------------------------------------------------------------------
app.post('/addforum', async (req, res) => {
  const { topicName, topicId, userId, userType, username, message, upvote, downvote, comments } = req.body;

  try {
    let topic = await Topic.findOne({ topicId: topicId });

    if (topic) {
      // If topic exists, add new message to it
      topic.messages.push({
        userId,
        userType,
        username,
        message,
        upvote,
        downvote,
        comments
      });
    } else {
      // If topic doesn't exist, create a new one
      topic = new Topic({
        topicName,
        topicId,
        messages: [{
          userId,
          userType,
          username,
          message,
          upvote,
          downvote,
          comments
        }]
      });
    }

    await topic.save();

    // Get the _id of the newly created message
    const messageId = topic.messages[topic.messages.length - 1]._id;

    res.status(200).json({ message: 'Forum saved successfully', messageId: messageId });
  } catch (error) {
    console.warn(error);
    res.status(500).json({ message: 'Error saving forum' });
  }
});
//----------------------------------------------------------------
//forum data retireval when page loads
app.get('/topics', async (req, res) => {
  try {
      const topics = await Topic.find();
      res.status(200).json(topics);
  } catch (error) {
      console.warn(error);
      res.status(500).json({ message: 'Error fetching topics' });
  }
});
//-----------------------------------------------------------------------
// Endpoint for updating votes
app.post('/updateVote', async (req, res) => {
  try {
      const { topicId, messageId, upvote, downvote } = req.body;
      const topic = await Topic.findOne({ topicId: topicId });
      const message = topic.messages.id(messageId);
      if (upvote) {
        message.upvote = parseInt(upvote);
      } else if (downvote) {
        message.downvote = parseInt(downvote);
      }
      await topic.save();
      res.status(200).json({ message: 'Vote updated successfully' });
  } catch (error) {
      console.warn(error);
      res.status(500).json({ message: 'Error updating vote' });
  }
});

//----------------------------------------------------------------------

// Endpoint for adding comments
app.post('/addComment', async (req, res) => {
  console.log('Received POST request at /addComment', req.body);
  try {
    const { topicId, messageId, comment, username, userType, userId } = req.body;
      const topic = await Topic.findOne({ topicId: topicId });
      if (!messageId) {
        res.status(400).json({ message: 'Message ID is required' });
        return;
      }
      const message = topic.messages.id(messageId);
      // Update the structure of the comment object to match the CommentSchema
      message.comments.push({ 
        userId: userId, 
        userType: userType, 
        username: username, 
        dateTime: new Date(),
        message: comment 
      });
      await topic.save();
      res.status(200).json({ success: true, message: 'Comment added successfully' });
  } catch (error) {
      console.warn(error);
      res.status(500).json({ success: false, message: 'Error adding comment' });
  }
});
//-------------------------------------------------------------------------
//announcement saving:

app.post('/addAnnouncement', async (req, res) => {
  const { title, date, description, userType, userId } = req.body;

  const newAnnouncement = new Announcement({
    title,
    date,
    description,
    userType,
    userId
  });

  try {
    await newAnnouncement.save();
    res.status(200).json({ message: 'Announcement saved successfully' });
  } catch (error) {
    console.warn(error);
    res.status(500).json({ message: 'Error saving announcement' });
  }
});
//-------------------------------------------------------------------
//fetch all the annnouncements:
// server.js
app.get('/getAnnouncements', async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.status(200).json(announcements);
  } catch (error) {
    console.warn(error);
    res.status(500).json({ message: 'Error getting announcements' });
  }
});
//--------------------------------------------------------------------
//save the data of user and enduser with itemid to p2p collection
app.post('/api/saveToP2P', async (req, res) => {
  const { ownerUser, ownerUserType, endUser, endUserType,itemtitle, itemId, status } = req.body;

  try {
    // Assuming you have a P2P model
    let p2p = new P2P({
      ownerUser,
      ownerUserType,
      endUser,
      endUserType,
      itemId,
      itemtitle,
      status
    });

    await p2p.save();

    res.status(200).json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//--------------------------------------------------------------------
app.put('/api/updateClaimStatus', async (req, res) => {
  const { itemId, status } = req.body;

  try {
    const updatedClaim = await ClaimList.findOneAndUpdate({ itemId: itemId }, { status: status }, { new: true });

    if (!updatedClaim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    res.status(200).json({ success: true, message: 'Claim status updated successfully', data: updatedClaim });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//--------------------------------------------------------------------
// P2P data retrieval when page loads
app.get('/p2p', async (req, res) => {
  const userId = req.query.userId;
  try {
    const p2p = await P2P.find({
      $or: [
        { ownerUser: userId },
        { endUser: userId }
      ]
    });
    res.status(200).json(p2p);
  } catch (error) {
    console.warn(error);
    res.status(500).json({ message: 'Error fetching P2P data' });
  }
});

//--------------------------------------------------------------------
//add messages p2p
app.post('/addmsgp2p', async (req, res) => {
  const { ownerUser, endUser, userId, userType, message, datetime } = req.body;

  try {
      const p2p = await P2P.findOne({ ownerUser: ownerUser, endUser: endUser });

      if (!p2p) {
          res.status(404).json({ message: 'No document found' });
      } else {
          p2p.messages.push({ user: userId, userType: userType, message: message, datetime: datetime });

          const result = await p2p.save();

          res.status(200).json({ message: 'Message updated successfully' });
      }
  } catch (error) {
      console.warn(error);
      res.status(500).json({ message: 'Error updating message' });
  }
});
//--------------------------------------------------------------------
//deletion on dropdown on p2p accept
app.delete('/deleteacceptchatItem', async (req, res) => {
  const { itemId } = req.body;

  try {
      await P2P.deleteOne({ itemId: itemId });
      await ClaimList.deleteOne({ itemId: itemId });
      await ListedItem.deleteOne({ itemId: itemId });
      await NewreqItem.deleteOne({ itemId: itemId });

      res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
      console.warn(error);
      res.status(500).json({ message: 'Error deleting item' });
  }
});
//--------------------------------------------------------------------
//deletion on close chat p2p dropdown
app.delete('/deleteCloseChatItem', async (req, res) => {
  const { itemId } = req.body;

  try {
      await P2P.deleteOne({ itemId: itemId });
      await ClaimList.deleteOne({ itemId: itemId });

      res.status(200).json({ message: 'Chat item deleted successfully' });
  } catch (error) {
      console.warn(error);
      res.status(500).json({ message: 'Error deleting chat item' });
  }
});
//-------------------------------------------------------------------------
//lists retrieve listed cards for admin

app.get('/api/listeditems', async (req, res) => {
  try {
    const listedItems = await ListedItem.find();; 
    res.status(200).json(listedItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

//--------------------------------------------------------------------------------
//requests retrieve listed cards for admin

app.get('/api/requesteditems', async (req, res) => {
  try {
    const reqItems = await NewreqItem.find();; 
    res.status(200).json(reqItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

//--------------------------------------------------------------------------------

//admin dashboard req item delete:
app.delete('/api/admindellistitems/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params; // get the id from the parameters
    const deletedItem = await ListedItem.findOneAndDelete({itemId: itemId}); // delete the item
    if (!deletedItem) {
      return res.status(404).json({ success: false, error: 'No item found with this ID' });
    }
    res.status(200).json({ success: true, data: deletedItem });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//-----------------------------------------------------------
//admin dashboard list item delete:
app.delete('/api/admindelreqitems/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params; // get the id from the parameters
    const deletedreqItem = await NewreqItem.findOneAndDelete({itemId: itemId}); // delete the item
    if (!deletedreqItem) {
      return res.status(404).json({ success: false, error: 'No item found with this ID' });
    }
    res.status(200).json({ success: true, data: deletedreqItem });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//-------------------------------------------------------------------------
app.put('/api/adminupdaterequesteditems/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const updatedValues = req.body; 

    // find the item and update it
    const updatedItem = await NewreqItem.findOneAndUpdate({itemId: itemId}, updatedValues, {new: true});

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: 'No item found with this ID' });
    }

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//--------------------------------------------------------------------------
app.put('/api/adminupdatelisteditems/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const updatedValues = req.body; 

    // find the item and update it
    const listupdatedItem = await ListedItem.findOneAndUpdate({itemId: itemId}, updatedValues, {new: true});

    if (!listupdatedItem) {
      return res.status(404).json({ success: false, error: 'No item found with this ID' });
    }

    res.status(200).json({ success: true, data: listupdatedItem });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//--------------------------------------------------------------------------
app.get('/api/adminstudentsget', async (req, res) => {
  try {
    // fetch all students
    const students = await Student.find({});

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//----------------------------------------------------------------
//admin student update:
app.post('/api/adminstdupdate', async (req, res) => {
  try {
    const updatedData = req.body;

    // Find the student and update their data
    const updatedStudent = await Student.findByIdAndUpdate(updatedData._id, updatedData, { new: true });

    if (!updatedStudent) {
      return res.status(404).json({ success: false, error: 'No student found with this ID' });
    }

    res.status(200).json({ success: true, data: updatedStudent });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//----------------------------------------------------------------------
app.delete('/api/adminstddel/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ success: false, error: 'No student found with this ID' });
    }

    res.status(200).json({ success: true, data: deletedStudent });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//-----------------------------------------------------------------------
//student verify
app.post('/api/verifyStudent/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedStudent = await Student.findByIdAndUpdate(id, { verify: true }, { new: true });

    if (!updatedStudent) {
      return res.status(404).json({ success: false, error: 'No student found with this ID' });
    }

    res.status(200).json({ success: true, data: updatedStudent });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//----------------------------------------------------------------------
app.get('/api/adminfacultyget', async (req, res) => {
  try {
    // fetch all students
    const faculty = await Faculty.find({});

    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//----------------------------------------------------------------
//admin student update:
app.post('/api/adminfacupdate', async (req, res) => {
  try {
    const updatedData = req.body;

    // Find the student and update their data
    const updatedFaculty = await Faculty.findByIdAndUpdate(updatedData._id, updatedData, { new: true });

    if (!updatedFaculty) {
      return res.status(404).json({ success: false, error: 'No Faculty found with this ID' });
    }

    res.status(200).json({ success: true, data: updatedFaculty });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//----------------------------------------------------------------------
app.delete('/api/adminfacdel/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFaculty = await Faculty.findByIdAndDelete(id);

    if (!deletedFaculty) {
      return res.status(404).json({ success: false, error: 'No Faculty found with this ID' });
    }

    res.status(200).json({ success: true, data: deletedFaculty });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//-----------------------------------------------------------------------

//raise ticket click by user
app.post('/api/listraiseticket', async (req, res) => {
  try {
    const { itemId, userId, chances, status } = req.body;
    const ticketitem = await ClaimList.findOne({ itemId, userId, chances, status });

    if (!ticketitem) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    ticketitem.status = 'reported';
    ticketitem.chances = 3;
    await ticketitem.save();

    const raiseItem = new Raiseticket(ticketitem.toObject());
    await raiseItem.save();


    res.status(200).json({ success: true, data: raiseItem });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//----------------------------------------------------------------------
//admin raise ticket fetch:
// Fetch all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Raiseticket.find({});
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//---------------------------------------------------------------------
app.listen(port, () => console.log(`Server is running on port ${port}`));