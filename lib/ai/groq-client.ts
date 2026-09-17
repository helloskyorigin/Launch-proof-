import Groq from 'groq-sdk';

// Initialize Groq client
// It will automatically pick up GROQ_API_KEY from environment variables
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;
