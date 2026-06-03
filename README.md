# 🚀 ReviewAI: Full-Stack AI-Powered Code Review Tool

ReviewAI is a premium, full-stack developer tool designed to help engineers ship better code faster. It offers instant, AI-driven code reviews, real-time code translations, and an interactive coding assistant—all wrapped in a sleek, glassmorphic dark-mode interface. 

Powered by **Groq API** (`llama-3.3-70b-versatile`) as the default engine for high-speed, precise evaluations, with built-in support for **Google Gemini** and **OpenAI GPT-4o-mini** as alternative providers.

---

## ✨ Features

*   **🔍 AI-Powered Code Reviews:** Scans for code quality, bugs, and security vulnerabilities. Provides Big-O performance metrics, cyclomatic complexity calculations, maintainability scores, and functional code refactoring suggestions.
*   **💬 Interactive Coding Assistant (Ask AI):** Chat with an expert AI assistant to debug, write, or explain complex code structures with real-time stream responses.
*   **🔄 Streaming Code Converter:** Instantly translate code between 13+ languages (Python, JavaScript, TypeScript, Rust, Go, C++, Java, Swift, Kotlin, and more) with real-time streaming output.
*   **📊 Review & Q&A History:** Keep track of previous code reviews, conversions, and conversations, backed by PostgreSQL.
*   **🔒 Secure Authentication:** Fully secure local registration/login and Google OAuth 2.0 integration.

---

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), TailwindCSS, Lucide Icons, React Syntax Highlighter, Monaco Editor, React Diff Viewer.
*   **Backend:** Node.js, Express, JWT, BcryptJS.
*   **Database:** PostgreSQL (Neon DB).
*   **AI Engines:** Groq SDK (`llama-3.3-70b-versatile`), Google Generative AI (`gemini-2.5-flash`), OpenAI SDK (`gpt-4o-mini`).

---

## 🚀 Local Quickstart

### Prerequisites
*   Node.js (v18+)
*   NPM
*   PostgreSQL database (e.g., Neon DB)

---

### 1. Database Setup
1. Create a free PostgreSQL instance at [Neon DB](https://neon.tech).
2. Create the schema tables by executing the SQL script:
    ```bash
    psql -d <your-db-url> -f backend/db/schema.sql
    ```
    *(Alternatively, paste the contents of `backend/db/schema.sql` directly into the Neon SQL Editor).*

---

### 2. Backend Installation & Setup
1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file in the `backend/` folder and populate it:
    ```env
    PORT=5000
    DATABASE_URL=your_postgresql_connection_string
    FRONTEND_URL=http://localhost:5173
    JWT_SECRET=your_custom_jwt_secret
    
    # AI API Keys
    GROQ_API_KEY=your_groq_api_key
    GEMINI_API_KEY=your_gemini_api_key
    OPENAI_API_KEY=your_openai_api_key
    
    # OAuth Configurations
    GOOGLE_CLIENT_ID=your_google_client_id
    ```
4. Run the development server:
    ```bash
    npm run dev
    ```

---

### 3. Frontend Installation & Setup
1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file in the `frontend/` folder:
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_GOOGLE_CLIENT_ID=your_google_client_id
    ```
4. Start the development server:
    ```bash
    npm run dev
    ```
5. Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## ☁️ Production Deployment

### Backend (Render)
1. Link your GitHub repository to [Render](https://render.com).
2. Create a new **Web Service** and set the root directory to `backend`.
3. Set the build command to `npm install` and start command to `node index.js`.
4. Configure the environment variables (`DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `FRONTEND_URL`, etc.) under the settings tab.

### Frontend (Vercel)
1. Link your GitHub repository to [Vercel](https://vercel.com).
2. Create a new project, select the directory `frontend`, and choose the **Vite** preset.
3. Configure `VITE_API_URL` pointing to your deployed backend URL.
4. Click **Deploy**.

---

## 🤝 Contributing
Contributions are always welcome! Feel free to open issues or submit pull requests to make ReviewAI even better.
