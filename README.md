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

### Host the backend on Render (free tier available)

GitHub Pages cannot run the Node server, so host `server/` separately on Render.

#### Step 1: Create Render account and service

1. Go to [render.com](https://render.com) and sign up (free account works).
2. Click **"New +"** → **"Web Service"**.
3. Connect your GitHub account and select the `bossiojmb1/isitascam` repository.
4. Configure the service:
   - **Name**: `isitascam-api` (or any name you like)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install` (or leave blank, Render will auto-detect)
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if you prefer)

#### Step 2: Add environment variables

In the Render dashboard for your service, go to **Environment** and add:

- **Key**: `OPENAI_API_KEY`
- **Value**: Your OpenAI API key (get it from [platform.openai.com/api-keys](https://platform.openai.com/api-keys))

> Note: Render sets `PORT` automatically, so you don't need to add it.

#### Step 3: Deploy

Click **"Create Web Service"**. Render will:
- Install dependencies
- Start your server
- Give you a URL like: `https://isitascam-api.onrender.com`

**Important**: The first deploy may take 2-3 minutes. After that, Render will auto-deploy whenever you push to `main`.

#### Step 4: Connect GitHub Pages to your Render backend

1. Go to your GitHub repo: **https://github.com/bossiojmb1/isitascam**
2. Go to **Settings → Secrets and variables → Actions**
3. Click **"Variables"** tab → **"New repository variable"**
4. Add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your Render URL (e.g., `https://isitascam-api.onrender.com`)
5. Click **"Add variable"**

#### Step 5: Rebuild Pages

Push any small change (or manually trigger the workflow) to rebuild Pages with the new API URL:

```powershell
cd "C:\Users\jimbo\Jims AI Code\isitascam"
git commit --allow-empty -m "Trigger Pages rebuild with Render API URL"
git push
```

After the Actions workflow completes, your site at `https://bossiojmb1.github.io/isitascam/` will use your Render backend for AI checks!


