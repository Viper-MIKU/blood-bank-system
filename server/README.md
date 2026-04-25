# Blood Bank System - Backend API

RESTful API for blood donation platform. Built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env` file in root:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/blood-bank
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:5173
```

See `.env.example` for all required variables.

### 3. Start Server
```bash
npm start
```

Server runs on `http://localhost:5000`

## 🏗️ Project Structure

```
server/
├── models/
│   ├── User.js          # User model & auth
│   └── Request.js       # Request model
├── server.js            # Express app & routes
├── package.json
└── .env
```

## 🔐 Authentication

- JWT-based token authentication
- Tokens included in `Authorization` header: `Bearer <token>`
- Password hashed with bcryptjs (10 salt rounds)
- Role-based access control (user/admin)

## 📝 API Routes

### Authentication
```
POST   /api/register              # Create account
POST   /api/login                 # User login (returns token)
```

### Users
```
GET    /api/users                 # Get all users (protected)
GET    /api/me                    # Get current user (protected)
PUT    /api/me                    # Update profile (protected)
```

### Blood Requests
```
POST   /api/request               # Send request (protected)
GET    /api/my-requests           # Get incoming (protected)
GET    /api/my-sent-requests      # Get sent (protected)
PUT    /api/request/:id           # Update status (protected)
```

### Admin
```
GET    /api/admin/overview        # Dashboard (admin only)
```

### Notifications
```
GET    /api/notifications         # Get notifications (protected)
PUT    /api/notifications/read    # Mark as read (protected)
```

## 📊 Data Models

### User
- `_id` - MongoDB ObjectId
- `name` - String
- `email` - String (unique)
- `password` - String (hashed)
- `bloodGroup` - String (A+, A-, B+, B-, O+, O-, AB+, AB-)
- `location` - String
- `availability` - String (available, busy, unavailable)
- `role` - String (user, admin)
- `bio` - String (optional)
- `createdAt`, `updatedAt` - Timestamps

### Request
- `_id` - MongoDB ObjectId
- `sender` - ObjectId (ref User)
- `receiver` - ObjectId (ref User)
- `message` - String
- `hospital` - String
- `requestLocation` - String
- `unitsNeeded` - Number
- `urgency` - String (normal, urgent, critical)
- `status` - String (pending, accepted, rejected)
- `createdAt`, `updatedAt` - Timestamps

## 🔄 Request Workflow

1. **Recipient sends request** → Stored with status: pending
2. **Donor receives notification** → Can accept/reject
3. **Status updated to accepted/rejected**
4. **Recipient notified** → Can view donor contact

## 🚨 Error Handling

- Standard HTTP status codes
- Consistent error response format:
```json
{
  "message": "Error description",
  "error": "error_code"
}
```

## 🔍 Middleware

- **CORS** - Cross-origin resource sharing
- **Auth** - JWT token verification
- **Admin Check** - Role-based access
- **Error Handler** - Global error handling

## 🧪 Testing Endpoints

### Register
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "bloodGroup": "O+",
    "location": "New York"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Users (with token)
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>"
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT auth
- **bcryptjs** - Password hashing
- **cors** - CORS middleware
- **dotenv** - Environment variables

## 🌐 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blood-bank
JWT_SECRET=secure_random_key_here
CORS_ORIGIN=https://yourdomain.com
```

### Hosting Options
- **Render.com** - Free tier, auto-deploy from GitHub
- **Railway** - Simple & affordable
- **Heroku** - (paid tier)
- **AWS/Google Cloud** - Full control

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test endpoints
4. Submit pull request

## 📄 License

MIT License

## 🆘 Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running locally or check connection string
- For Atlas, add IP to whitelist

**CORS Error**
- Check `CORS_ORIGIN` matches client URL
- In development: should be `http://localhost:5173`

**JWT Error**
- Ensure token format is `Bearer <token>` in header
- Token might be expired

---

Built with ❤️ by BloodBank Team
   ```

3. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://127.0.0.1:5000`.

## API Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/users` - Get all users (authenticated)
- `POST /api/request` - Send blood request (authenticated)
- `GET /api/my-requests` - Get user's requests (authenticated)
- `PUT /api/request/:id` - Update request status (authenticated)