# Long-Term Memory Assistant

> **Phase 1 — Basic AI Chat Foundation**

A modern full-stack web application establishing the clean, scalable foundation for an intelligent personal AI assistant powered by **Amazon Bedrock**.

Phase 1 focuses exclusively on delivering a robust, secure, and responsive chat architecture without persistent memory. In subsequent phases, this foundation will be augmented with long-term vector memory (Amazon OpenSearch) and knowledge graph memory (Amazon Neptune).

---

## Architecture Overview

### Current (Phase 1) Flow

```
┌────────────────────────┐
│  React Frontend (Vite) │
└───────────┬────────────┘
            │  POST /api/chat (JSON payload)
            ▼
┌────────────────────────┐
│ Node.js / Express API  │  <-- Input validation, CORS, error isolation
└───────────┬────────────┘
            │  AWS SDK v3 ConverseCommand
            ▼
┌────────────────────────┐
│     Amazon Bedrock     │  <-- Claude 3 / Nova / Llama (Configurable)
└───────────┬────────────┘
            │  Generated AI Text Response
            ▼
┌────────────────────────┐
│  React Frontend (Vite) │  <-- Displays formatted message in conversation
└────────────────────────┘
```

> **Security Guardrail:** The frontend **never** holds AWS credentials or directly contacts AWS services. All Bedrock invocations are managed securely by the backend via the AWS SDK standard credential provider chain.

---

## Monorepo Directory Structure

```
long-term-memory-assistant/
│
├── frontend/                               # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx                 # App header with phase badge & health status
│   │   │   ├── ChatWindow.tsx             # Message history, empty state & thinking state
│   │   │   ├── MessageBubble.tsx          # Distinct styling for User vs Assistant
│   │   │   └── ChatInput.tsx              # Autogrowing input, keyboard shortcuts
│   │   ├── types/
│   │   │   └── chat.ts                    # Frontend chat TypeScript definitions
│   │   ├── App.tsx                        # Main state orchestrator
│   │   ├── main.tsx                       # React DOM entry point
│   │   └── index.css                      # Tailwind styling & sleek dark scrollbars
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts                     # Vite config with API reverse proxy
│
├── backend/                                # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── chat.ts                    # POST /api/chat and GET /api/health
│   │   ├── services/
│   │   │   └── bedrock.ts                 # Dedicated Amazon Bedrock service wrapper
│   │   ├── types/
│   │   │   └── chat.ts                    # Backend request/response types
│   │   ├── app.ts                         # Express application setup & middleware
│   │   └── server.ts                      # Server listener entry point
│   ├── tests/
│   │   └── chat.test.ts                   # Automated Jest & Supertest suites (mocked AWS)
│   ├── .env.example                       # Environment template
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
│
├── design.md                              # Product UI & visual design specification
├── README.md                              # Setup, AWS configuration & architecture documentation
└── .gitignore                             # Secret & artifact exclusion rules
```

---

## Prerequisites

1. **Node.js**: `v18.x` or higher (verified with `v20+` / `v24+`).
2. **npm**: `v9.x` or higher.
3. **AWS Account**: With access to Amazon Bedrock models.

---

## AWS Setup & Minimum IAM Permissions

### 1. Enable Model Access in AWS Bedrock Console
Amazon Bedrock requires enabling model access before invocation:
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/bedrock).
2. Ensure you are in your desired region (e.g. `us-east-1` or `us-west-2`).
3. In the left navigation, choose **Model access**.
4. Click **Enable specific models** (or **Modify model access**), select your desired model (e.g., Anthropic Claude 3 Haiku or Amazon Nova Micro), and submit.

### 2. Minimum Required IAM Policy
Follow the principle of least privilege. Do **not** grant administrator credentials. The backend requires only `bedrock:InvokeModel`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockInvokeModelOnly",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/*"
      ]
    }
  ]
}
```

### 3. Configuring Local AWS Credentials Securely
The backend uses the **AWS SDK Standard Credential Provider Chain**. Do **not** hardcode credentials in code or commit them to Git.

**Recommended Option A: AWS CLI**
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region (e.g., us-east-1)
```

**Option B: Standard Environment Variables in Terminal**
```bash
# On Linux/macOS
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_REGION="us-east-1"

# On Windows (PowerShell)
$env:AWS_ACCESS_KEY_ID="your-access-key-id"
$env:AWS_SECRET_ACCESS_KEY="your-secret-access-key"
$env:AWS_REGION="us-east-1"
```

---

## Environment Variables Configuration

Copy the example file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Local port where Express server listens | `5000` |
| `AWS_REGION` | AWS region where Bedrock model is hosted | `us-east-1` |
| `BEDROCK_MODEL_ID` | Amazon Bedrock model identifier | `anthropic.claude-3-haiku-20240307-v1:0` |
| `CORS_ORIGIN` | Allowed origin for frontend requests | `http://localhost:5173` |

### Supported Bedrock Models
The backend uses Bedrock's unified `ConverseCommand`, which natively supports:
- `anthropic.claude-3-haiku-20240307-v1:0` (Fast & cost-effective)
- `anthropic.claude-3-5-haiku-20241022-v1:0`
- `anthropic.claude-3-5-sonnet-20240620-v1:0`
- `amazon.nova-micro-v1:0`
- `amazon.nova-lite-v1:0`
- `meta.llama3-8b-instruct-v1:0`

---

## Running the Application Locally

### 1. Start the Backend Server

```bash
cd backend
npm install
npm run dev
```

The backend starts at `http://localhost:5000`:
- Health check: `GET http://localhost:5000/api/health`
- Chat API: `POST http://localhost:5000/api/chat`

### 2. Start the Frontend Client

In a separate terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Running Automated Tests

The backend includes a comprehensive suite of unit and integration tests using Jest and Supertest. All Bedrock calls are mocked, so automated tests run completely offline without incurring AWS costs or requiring live credentials:

```bash
cd backend
npm test
```

### Covered Test Cases:
- `GET /api/health` returns status `200 OK`
- `POST /api/chat` with valid single message returns `200 OK` and AI reply
- `POST /api/chat` with conversation context returns `200 OK` and AI reply
- Empty message handling (returns `400 Bad Request` with `{ error: "Message cannot be empty" }`)
- Empty request body / malformed payload validation
- Bedrock failure handling (returns safe `500 Internal Server Error` without leaking stack traces or credentials)

---

## Preparation for Future Phases (Phase 2 & Beyond)

Phase 1 is explicitly designed to remain clean and extensible without rewriting:

1. **Modular Service Layer (`services/bedrock.ts`):**
   In Phase 2, memory extraction and retrieval will wrap around the Bedrock service:
   ```
   POST /api/chat
         │
         ▼
   retrieveMemory() ───────► (Phase 2: OpenSearch Vector Search + Neptune Graph)
         │
         ▼
   bedrockService.generateResponse(promptWithContext)
         │
         ▼
   extractMemory() ────────► (Phase 2: Extract & store new facts/entities)
         │
         ▼
   Client Response
   ```
2. **Decoupled API Contract:**
   The frontend simply exchanges `{ messages: [...] }` with the backend. When long-term memory is active in Phase 2, the frontend contract remains stable, while optionally receiving enriched metadata (e.g. recalled memories).
3. **Stateless Backend:**
   No session affinity is stored in Express, making it directly portable to AWS Lambda and API Gateway when transitioning to serverless deployment.
