const mongoose = require('mongoose');

// Define MongoDB Schema
// Unlike PostgreSQL, MongoDB is schema-flexible
// but we define a schema for consistency
const AILogSchema = new mongoose.Schema(
  {
    // Product the description was generated for
    productName: {
      type: String,
      required: true
    },

    // Category used in the prompt
    category: {
      type: String,
      default: 'General'
    },

    // The actual AI generated description
    generatedDescription: {
      type: String,
      required: true
    },

    // Who triggered the generation
    userEmail: {
      type: String,
      default: 'anonymous'
    },

    // Which AI model was used
    modelUsed: {
      type: String,
      default: 'gemini-2.5-flash'
    },

    // Raw prompt sent to AI (useful for debugging)
    prompt: {
      type: String
    }
  },
  {
    // timestamps: true auto adds createdAt and updatedAt
    timestamps: true
  }
);

// Create and export the model
// 'AILog' = collection name in MongoDB will be 'ailogs'
const AILogMongo = mongoose.model('AILog', AILogSchema);

module.exports = AILogMongo;