# IsItAScam

A small web app that helps you quickly check if a message or email **looks like a scam**.

- **Frontend**: React + TypeScript + Vite (`client/`)
- **Backend**: Node + Express (`server/`) with optional OpenAI analysis

> This tool cannot guarantee that something is safe. Use it as a helper alongside your own judgement.

## Running locally

### 1. Start the API server (optional but recommended)

```powershell
cd "C:\Users\jimbo\Jims AI Code\isitascam\server"
npm install
```

Create a `.env` file in `server/` next to `index.js`:

```env
OPENAI_API_KEY=sk-REPLACE_WITH_YOUR_KEY
PORT=4000
```

Then run:

```powershell
npm run dev
```

The API will listen on `http://localhost:4000`.

### 2. Start the frontend

```powershell
cd "C:\Users\jimbo\Jims AI Code\isitascam\client"
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5174/`) in your browser.

## How it works

- **Rule-based check (always on)**  
  The browser analyses your pasted message for common red flags:
  - Payment requests via gift cards, crypto, or wire transfers
  - Urgent pressure or secrecy
  - Too-good-to-be-true prizes or guaranteed returns
  - Requests for very sensitive data (SSN, bank details, etc.)
  - Impersonation of banks/governments + “verify your account” links

  It then shows a verdict such as **Likely scam**, **Possibly a scam**, or **Probably safe** with plain-language reasons.

- **AI check (optional)**  
  If the checkbox is enabled and the backend is running with a valid `OPENAI_API_KEY`, the frontend sends the message to:

  ```text
  POST http://localhost:4000/api/check-ai
  ```

  The server calls OpenAI (e.g. `gpt-4o-mini`) and returns a short, friendly explanation of the risk and what to do.

If the AI check isn’t available (server off or no key), the rule-based result still works and you’ll see a note about AI being unavailable.

