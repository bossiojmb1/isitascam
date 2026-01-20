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

## Hosting (GitHub Pages + small backend)

### Host the frontend on GitHub Pages

This repo includes a GitHub Actions workflow at:

- `.github/workflows/deploy.yml`

Steps:

1. Create a GitHub repo (example name: `isitascam`) and push this folder as its own repo.
2. In the GitHub repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. After the Actions workflow runs, your site will be available at:

```text
https://bossiojmb1.github.io/isitascam/
```

> The client build is configured for Pages subpaths via `client/vite.config.ts` (`base: "/isitascam/"`).

### Host the backend (recommended: Render)

GitHub Pages cannot run the Node server, so host `server/` separately.

1. Create a new **Web Service** on Render and connect your GitHub repo.
2. Set **Root Directory**: `server`
3. Set **Build Command**: `npm ci`
4. Set **Start Command**: `node index.js`
5. Add environment variables:
   - `OPENAI_API_KEY`: your OpenAI key
   - `PORT`: `4000` (Render may set its own PORT; the server supports that too)
6. Deploy. You’ll get a URL like:

```text
https://isitascam-api.onrender.com
```

### Connect Pages → Backend

In your GitHub repo settings, add an Actions variable:

- **Settings → Secrets and variables → Actions → Variables**
  - Name: `VITE_API_BASE_URL`
  - Value: your Render URL, e.g. `https://isitascam-api.onrender.com`

Then push any commit; the Pages build will rebuild with the correct API base URL.


