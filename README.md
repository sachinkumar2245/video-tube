# 🎬 Video Tube Backend

This repository contains the **backend architecture** for **Video Tube**, a YouTube-inspired video streaming platform. It is designed with **Node.js, Express, and MongoDB**, following clean, scalable, and modular coding practices.

---

## ⚙️ Features

* 🔑 **Authentication & Authorization** using JWT
* 👤 **User Management** (registration, login, profile management)
* 📹 **Video Upload & Management** with Cloudinary integration
* 📜 **Centralized Error & Response Handling**
* 🛠 **Middleware for validation & async handling**
* 🧩 **Modular and Scalable Architecture**

---

## 🛠 Tech Stack

* **Backend Framework**: Node.js, Express.js
* **Database**: MongoDB (Mongoose ORM)
* **Authentication**: JWT
* **File Storage**: Cloudinary
* **Utilities**: Custom API error/response handlers, async middleware

---

## 📂 Folder Structure

```
VIDEO_TUBE/
│── node_modules/
│── public/
│── src/
│   ├── controllers/       # Route controllers (User, Video, Healthcheck)
│   ├── db/                # Database connection logic
│   ├── middlewares/       # Custom middlewares
│   ├── models/            # Mongoose schemas/models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions (errors, responses, handlers)
│   ├── app.js             # Express app configuration
│   ├── constants.js       # Application constants
│   └── index.js           # App entry point
│
├── .env                   # Environment variables
├── .env.sample            # Example environment variables
├── .gitignore             # Git ignore rules
├── .prettierrc            # Code formatter config
├── .prettierignore        # Ignore rules for Prettier
├── package.json           # Project dependencies & scripts
├── package-lock.json      # Lock file
└── README.md              # Project documentation
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/video-tube-backend.git
cd video-tube-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory and update it according to `.env.sample`.

### 4. Run the server

```bash
npm run dev   # development mode
npm start     # production mode
```

Server will start on `http://localhost:4000` (or as per your config).

---

## 📡 API Endpoints

### Healthcheck

* `GET /api/healthcheck` → Check API status

### User

* `POST /api/users/register` → Register new user
* `POST /api/users/login` → User login
* `GET /api/users/me` → Get logged-in user profile

### Video (WIP)

* `POST /api/videos/upload` → Upload video
* `GET /api/videos/:id` → Get video details

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and create a pull request.

---

## 📜 License

This project is licensed under the **MIT License**.
