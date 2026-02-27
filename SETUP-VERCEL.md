# 🚀 Vercel Deployment Setup (Cloud-Local Hybrid)

Lumina 0.4.0 uses a **Hybrid Architecture**:
- **Frontend + API**: Hosted on Vercel (Edge & Serverless).
- **AI Brain**: Hosted on your local PC (LM Studio) via ngrok.

---

## **Step 1: Local AI Setup (On your PC)**
1.  Open **LM Studio**.
2.  Load your model (e.g., Llama 3).
3.  Go to the **Local Server** tab (↔️ icon).
4.  Set Port to `1234` and click **Start Server**.
5.  Open your terminal and start **ngrok**:
    ```bash
    ngrok http 1234
    ```
6.  Copy the `Forwarding` URL (e.g., `https://xxxx-xxxx.ngrok-free.dev`).

---

## **Step 2: Vercel Environment Variables**
In your Vercel Dashboard (**Settings → Environment Variables**), add:

| Key | Value |
| :--- | :--- |
| `LM_STUDIO_URL` | Your ngrok URL from Step 1 |
| `LM_STUDIO_API_KEY` | `lm-studio` |
| `VITE_API_URL` | `/api/v1` |
| `VITE_APP_NAME` | `Lumina Engine` |

---

## **Step 3: Deployment**
Push your changes to GitHub. Vercel will automatically build and deploy.

### **Manual Build (Optional)**
If you want to build locally first:
```bash
npm run build
```

---

## **🔧 Troubleshooting 404s/Timeouts**
1.  **"Status: 404"**: Ensure your `vercel.json` has the correct rewrites for `/api/v1/`.
2.  **"Failed to reach AI"**: 
    - Check if ngrok is still running.
    - Test the diagnostic ping: `https://your-app.vercel.app/api/v1/ping`.
3.  **Deployment Conflicts**: If you see `"functions" cannot be used with "builds"`, use the root `package.json` for builds and only use `functions` for timeouts in `vercel.json`.

---

## **📊 Verification Check**
✅ **Ping Test**: `/api/v1/ping` returns `{"status": "online"}`.
✅ **Domain List**: `/api/v1/domains/` returns the business personas.
✅ **Chat**: Sending a message triggers the ngrok tunnel and returns AI text.

---
*Last Updated: 2026-02-27 - Hybrid Architecture Refactor*
