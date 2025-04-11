# 🏁 F1 Tracker App

A fullstack web app to import, save, and manage Formula 1 race data — including rain status, comments, and favorites.

---

## 🛠 Stack

- **Frontend**: React (Vite)  
- **Backend**: Express.js + Prisma  
- **Database**: PostgreSQL (Railway)

---

## 🚀 Getting Started Locally

### 1. Clone the repo

```bash
git clone https://github.com/Mayyyk/f1-tracker.git
cd f1-tracker
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create `.env` file:

1) Version with DB hosted online: (I'm not giving mine for safety)

```env
DATABASE_URL="your_online_db_url"
```

2) Version with DB hosted on local machine:

```env
DATABASE_URL="your_local_db_url"
```


Run local dev server:

```bash
npm run dev
```

App will run on: [http://localhost:5000](http://localhost:5000)

### 3. Set up the frontend

```bash
cd ../client
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Run the frontend:

```bash
npm run dev
```

App will run on: [http://localhost:5173](http://localhost:5173)

---

## 💾 Migrations & Database

Using Prisma creates a need to push schema changes:

```bash
cd server
npx prisma migrate dev
```

To deploy migrations to Railway:

```bash
railway run npx prisma migrate deploy --schema=prisma/schema.prisma
```

Make sure `.env` has correct `DATABASE_URL`.

---

## 📂 Folder Structure

```
f1-tracker/
├── client/     # React frontend (Vite)
│   ├── src/
│   └── .env
├── server/     # Express backend + Prisma
│   ├── controllers/
│   ├── prisma/
│   ├── routes/
│   ├── utils/
│   └── .env
```

---

## ✅ Features

- 🌐 Import F1 races by season  
- 💾 Save / delete races to DB  
- 🌧️ Mark if it rained  
- 🗒️ Add comments  
- ⭐ Mark favorite race  
- 🌓 Dark UI

---

## 🖍️ Diagrams in Miro

https://miro.com/app/board/uXjVIDro7y4=/?share_link_id=593259922903

---

## 🧠 Notes

- Frontend dynamically switches between dev and production based on `NODE_ENV`
- Prisma uses PostgreSQL; DB can be local or via Railway
- To avoid errors on deploy, ensure `.env` is valid and migration has been applied

---

## 📓 Future plans

- Google OAuth
- Adding friends
- Multible tables and schemas - drivers, tracks, etc...
- OpenWeather API integration for fetching weather during race

---

## 🔗 Deployment (Railway + Vercel)

- Backend: deployed via Railway (auto-build from `server/`)
- Frontend: deployed via Vercel (auto-build from `client/`, using `VITE_API_URL`)

---

## 📬 Contact

Built with ❤️ by @Mayyyk

