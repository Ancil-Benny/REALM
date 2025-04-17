const AddItem = require('../models/AddItem');
const ListedItem = require('../models/ListedItem');
const RequestedItem = require('../models/RequestedItem');
const { compareVerificationAnswers } = require('../services/similarityService');

// @desc    Get all item templates from additems collection
// @route   GET /additems
// @access  Public
exports.getAddItems = async (req, res) => {
  try {
    const items = await AddItem.find({});
    
    res.status(200).json({
      success: true,
      additems: items
    });
  } catch (error) {
    console.error('Error fetching item templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch item templates'
    });
  }
};

// @desc    Get all listed items
// @route   GET /api/listeditems
// @access  Public (can be changed to protected if needed)
exports.getListedItems = async (req, res) => {
  try {
    const items = await ListedItem.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('userId', 'username'); // Include user details if needed
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching listed items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listed items'
    });
  }
};

// @desc    Get all requested items
// @route   GET /api/reqitems
// @access  Public (can be changed to protected if needed)
exports.getRequestedItems = async (req, res) => {
  try {
    const items = await RequestedItem.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('userId', 'username'); // Include user details if needed
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching requested items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch requested items'
    });
  }
};

// @desc    Add a new listed item
// @route   POST /addquestsubmit
// @access  Protected
exports.addListedItem = async (req, res) => {
  try {
    const { title, iconName, category, questions, verificationQuest } = req.body;
    
    // Validate inputs
    if (!title || !iconName || !category || !questions || !verificationQuest) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }
    
    // Create listed item
    const newItem = await ListedItem.create({
      title,
      iconName,
      category,
      questions,
      verificationQuest,
      userId: req.user.id
    });
    
    res.status(201).json({
      success: true,
      item: newItem
    });
  } catch (error) {
    console.error('Error creating listed item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create listed item'
    });
  }
};

// @desc    Add a new requested item
// @route   POST /newreqsubmit
// @access  Protected
exports.addRequestedItem = async (req, res) => {
  try {
    const { title, iconName, category, questions, verificationQuest } = req.body;
    
    // Validate inputs
    if (!title || !iconName || !category || !questions || !verificationQuest) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }
    
    // Create requested item
    const newItem = await RequestedItem.create({
      title,
      iconName,
      category,
      questions,
      verificationQuest,
      userId: req.user.id
    });
    
    res.status(201).json({
      success: true,
      item: newItem
    });
  } catch (error) {
    console.error('Error creating requested item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create requested item'
    });
  }
};

// @desc    Check verification answers
// @route   POST /api/compare-answers
// @access  Public
exports.compareAnswers = async (req, res) => {
  try {
    const { userAnswer, correctAnswer } = req.body;
    
    // Basic string similarity function
    const calculateSimilarity = (str1, str2) => {
      // Convert to lowercase for case-insensitive comparison
      const s1 = str1.toLowerCase();
      const s2 = str2.toLowerCase();
      
      // Perfect match
      if (s1 === s2) return 1.0;
      
      // One is a substring of the other
      if (s1.includes(s2) || s2.includes(s1)) return 0.8;
      
      // More complex similarity algorithm could be implemented here
      // For now, let's use a simple character matching approach
      let matches = 0;
      const maxLength = Math.max(s1.length, s2.length);
      
      if (maxLength === 0) return 1.0; // Both strings are empty
      
      // Count matching characters by position
      const minLength = Math.min(s1.length, s2.length);
      for (let i = 0; i < minLength; i++) {
        if (s1[i] === s2[i]) matches++;
      }
      
      return matches / maxLength;
    };
    
    const similarity = calculateSimilarity(userAnswer, correctAnswer);
    const isSimilar = similarity >= 0.7; // Threshold for similarity
    
    res.status(200).json({
      similarity,
      isSimilar
    });
  } catch (error) {
    console.error('Error comparing answers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare answers'
    });
  }
};

// @desc    Verify user answers against stored verification answers
// @route   POST /api/verify-answers
// @access  Public (but authentication is recommended)
exports.verifyAnswers = async (req, res) => {
  try {
    const { itemId, type, answers } = req.body;
    
    // Validate inputs
    if (!itemId || !type || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Find the item based on type
    let item;
    if (type === 'listed') {
      item = await ListedItem.findById(itemId);
    } else if (type === 'requested') {
      item = await RequestedItem.findById(itemId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type'
      });
    }
    
    // Check if item exists
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Get correct answers from the item
    const correctAnswers = item.verificationQuest.map(q => q.answer);
    const questions = item.verificationQuest.map(q => q.question);
    
    // Compare using the similarity service
    const comparisonResults = compareVerificationAnswers(answers, correctAnswers);
    
    // Add questions to the results
    const detailedResults = comparisonResults.results.map((result, index) => ({
      ...result,
      question: questions[index] || 'Unknown question'
    }));
    
    // Generate HTML for detailed results
    const resultHtml = `
      <div class="verification-results">
        <h3>Verification Results</h3>
        <p>Overall similarity: <strong>${(comparisonResults.overallSimilarity * 100).toFixed(1)}%</strong></p>
        <p>Matched questions: <strong>${comparisonResults.matchCount} of ${comparisonResults.totalQuestions}</strong></p>
        <p>Status: <strong>${comparisonResults.isVerified ? 'VERIFIED' : 'VERIFICATION FAILED'}</strong></p>
        
        <hr>
        <h4>Detailed Results:</h4>
        <ul class="verification-details">
          ${detailedResults.map(result => `
            <li class="${result.similarity >= 0.7 ? 'match' : 'mismatch'}">
              <p><strong>Question:</strong> ${result.question}</p>
              <p><strong>Your answer:</strong> ${result.userAnswer}</p>
              <p><strong>Match score:</strong> ${(result.similarity * 100).toFixed(1)}%</p>
            </li>
          `).join('')}
        </ul>
        
        ${comparisonResults.isVerified ? `
          <div class="success-message">
            <h4>Congratulations!</h4>
            <p>You have successfully verified this item.</p>
            <p>(Can proceed to next steps here like redirection to a built in Chat interface)</p>
          </div>
        ` : `
          <div class="failure-message">
            <h4>Verification Failed</h4>
            <p>Your answers did not match the verification criteria.</p>
          </div>
        `}
      </div>
    `;
    
    // Return verification results
    res.status(200).json({
      success: comparisonResults.isVerified,
      similarity: comparisonResults.overallSimilarity,
      resultHtml,
      message: comparisonResults.isVerified ? 'Verification successful' : 'Verification failed',
      details: detailedResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during verification process',
      error: error.message
    });
  }
};

// Helper function to calculate string similarity
function calculateSimilarity(str1, str2) {
  // Convert to lowercase for case-insensitive comparison
  const s1 = String(str1).toLowerCase();
  const s2 = String(str2).toLowerCase();
  
  // Perfect match
  if (s1 === s2) return 1.0;
  
  // One is a substring of the other
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // More complex similarity algorithm using Levenshtein distance
  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 1.0; // Both strings are empty
  
  const levenshteinDistance = (a, b) => {
    const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill());
    
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i-1] === b[j-1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1,      // deletion
          matrix[i][j-1] + 1,      // insertion
          matrix[i-1][j-1] + cost  // substitution
        );
      }
    }
    
    return matrix[a.length][b.length];
  };
  
  const distance = levenshteinDistance(s1, s2);
  return 1 - (distance / maxLength);
}