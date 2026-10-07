import { app } from './app';

const PORT = process.env.PORT || 5000;
const REGION = process.env.AWS_REGION || 'us-east-1';
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🤖 Long-Term Memory Assistant - Backend`);
  console.log(`   Phase 1: Basic AI Chat Foundation`);
  console.log(`=========================================`);
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 AWS Region:        ${REGION}`);
  console.log(`🧠 Bedrock Model ID:  ${MODEL_ID}`);
  console.log(`🔒 Credentials:       Standard AWS Provider Chain`);
  console.log(`=========================================`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

