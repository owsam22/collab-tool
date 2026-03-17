# CollabSpace — Real-Time Video Collaboration Tool

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://collab-tool-self.vercel.app)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)

A professional, full-stack MERN platform for real-time collaboration. Features include multi-user video conferencing (WebRTC), screen sharing, a synchronized whiteboard, instantaneous chat, and secure file sharing.

🚀 **Live Frontend:** [https://collab-tool-self.vercel.app](https://collab-tool-self.vercel.app)  
backend: [https://collab-tool-backend-9psv.onrender.com/](https://collab-tool-backend-9psv.onrender.com/)

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite + TailwindCSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas |
| **Real-Time** | Socket.io (Data Sync & Notifications) |
| **Video/Audio**| WebRTC (Signaling via Socket.io) |
| **Auth** | JWT (Stateless Authentication) |
| **Deployment**| Vercel (Frontend) & Render (Backend) |

## ✨ Key Features

- **🌐 Multi-user Video Calling**: High-quality P2P video/audio conferencing using WebRTC.
- **🖥️ Screen Sharing**: Integrated one-click screen sharing for presentations.
- **🎨 Collaborative Whiteboard**: Real-time synchronized drawing board with persistent state.
- **💬 Instant Chat**: Global and room-based chat with typing indicators.
- **📂 File Management**: Securely upload, download, and manage files within meeting rooms.
- **🔔 Smart Notifications**: Real-time toast notifications for user actions.
- **🔐 Secure Auth**: Robust JWT-based registration and login system.

## 🚀 Quick Start

### 1. Installation
```bash
npm run install:all
```

### 2. Environment Setup
Create a `.env` file in the `backend` directory following the architecture:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

### 3. Execution
```bash
# Start Backend & Frontend
npm run dev:backend
npm run dev:frontend
```

## 📂 Project Structure

```text
├── backend/            # Express server, Socket.io, & MongoDB Models
├── frontend/           # React SPA with Vite & Tailwind
│   └── src/
│       ├── api/        # Axios configuration for production endpoints
│       ├── context/    # Global State (Auth & Sockets)
│       └── components/ # Reusable UI Modules
└── vercel.json         # SPA routing configuration
```

## 🛡️ Credits & Author

Developed with ❤️ by **[owsam22](https://github.com/owsam22)**.

Repository: [https://github.com/owsam22/collab-tool](https://github.com/owsam22/collab-tool)

---
*This project was built as part of a mission to create seamless, high-performance collaboration tools for modern teams.*
