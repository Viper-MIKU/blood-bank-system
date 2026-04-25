# 🩸 BloodBank - Blood Donation Platform

A modern, responsive web application that connects blood donors with recipients in need. Users can search for donors by blood group and location, send blood requests, and manage incoming donation requests.

## 🌟 Features

### For Donors
- **Browse Recipients**: Search for blood requests by urgency, location, and blood group
- **Accept/Reject Requests**: Respond to incoming blood donation requests
- **Availability Status**: Mark yourself as available, busy, or unavailable
- **Profile Management**: Add bio, location, and donation history

### For Recipients  
- **Find Donors**: Search available donors by blood group and city
- **Send Requests**: Quick request form with hospital details and urgency level
- **Track Status**: Monitor pending, accepted, and rejected requests
- **Notifications**: Real-time alerts when donors respond

### For Admins
- **Dashboard Overview**: View total users, available donors, and pending requests
- **User Management**: Monitor recent users and their availability
- **Request Tracking**: See all requests and their status
- **System Analytics**: Quick metrics and insights

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite 8** - Fast build tool
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations
- **Custom responsive CSS** - CSS variables, animations, and layout
- **Axios** - HTTP client

### Backend
- **Node.js + Express.js** - Server framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin support

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git

## 🚀 Quick Start

### Backend Setup
```bash
cd server
npm install

# Create .env file
echo "PORT=5000" > .env
echo "MONGODB_URI=mongodb://localhost:27017/blood-bank" >> .env
echo "JWT_SECRET=your_secret_key" >> .env

npm start
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 📁 Project Structure

```
blood-bank-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities
│   │   └── index.css       # Global styles
│   └── vite.config.js
│
├── server/                 # Express backend
│   ├── models/             # Database models
│   ├── server.js           # Entry point
│   └── package.json
│
└── README.md
```

## 🔐 Authentication

- JWT-based authentication
- Tokens stored in localStorage
- Automatic inclusion in API requests
- Secure password hashing with bcryptjs

## 📱 Responsive Design

- **Mobile First** approach
- Breakpoints: 480px, 600px, 768px, 900px, 1200px
- Dark mode support
- Touch-optimized UI

## 🌐 Deployment

### Vercel (Frontend)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Auto-deploy on push

### Backend Options
- Render.com (free tier)
- Railway
- Heroku (paid)
- DigitalOcean

## 🔑 Environment Variables

### Server
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blood-bank
JWT_SECRET=your-secret-key-here
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.vercel.app
```

### Client
```env
VITE_API_URL=https://your-api-url.com/api
```

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Create account |
| POST | `/api/login` | User login |
| GET | `/api/me` | Get current user |
| GET | `/api/users` | Get all users |
| POST | `/api/request` | Send request |
| GET | `/api/my-requests` | Get incoming |
| GET | `/api/notifications` | Get alerts |

## 🎨 Design Features

- Smooth page transitions
- Animated components
- Glassmorphic UI elements
- Gradient backgrounds
- SVG blood donor illustration
- Professional color scheme

## 🚨 Error Handling

- Form validation
- Network error recovery
- User-friendly error messages
- Loading states
- Feedback notifications

## 📊 Database Schema

### User Model
- name, email, password
- bloodGroup, location, availability
- bio, role (user/admin)

### Request Model
- sender, receiver, message
- hospital, requestLocation, unitsNeeded
- urgency, status (pending/accepted/rejected)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push and create Pull Request

## 📄 License

MIT License - see LICENSE file

## 🙋 Support

- Report issues on GitHub
- Start discussions for features

---

Made with ❤️ for blood donors and recipients