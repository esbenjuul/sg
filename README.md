# Fresh Auth App

A modern authentication system built with **Deno Fresh 2** and **MongoDB**, featuring secure user registration, login, and session management.

## Features

- 🔒 **Secure Authentication**: Password hashing with bcrypt
- 🍪 **Session Management**: HMAC-signed session tokens stored in HTTP-only cookies
- 🗄️ **MongoDB Integration**: Reliable user data storage with native Deno MongoDB driver
- ⚡ **Fresh 2**: Built on Deno Fresh 2 with Vite for optimal performance
- 🎨 **Clean CSS**: Semantic HTML with vanilla CSS (no frameworks!)
- 🐳 **Docker Support**: Easy local development with Docker Compose

## Prerequisites

- [Deno](https://deno.land/) (v1.38 or higher)
- [Docker](https://www.docker.com/) and Docker Compose (for MongoDB)

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd sg

# Copy environment variables
cp .env.example .env

# Update .env with your settings if needed
```

### 2. Start MongoDB with Docker

```bash
# Start MongoDB and Mongo Express (web UI)
docker-compose up -d

# Check if containers are running
docker-compose ps
```

MongoDB will be available at `mongodb://localhost:27017`  
Mongo Express (Web UI) will be available at `http://localhost:8081`

### 3. Install Dependencies and Run

```bash
# Install dependencies
deno install

# Start the Fresh development server
deno task dev
```

The app will be available at **http://localhost:5173**

## Project Structure

```
.
├── routes/
│   ├── _app.tsx              # App layout wrapper
│   ├── _middleware.ts        # Global middleware registration
│   ├── index.tsx             # Home page
│   ├── login.tsx             # Login page
│   ├── signup.tsx            # Signup page
│   ├── dashboard/
│   │   └── index.tsx         # Protected dashboard
│   └── api/
│       └── auth/
│           ├── login.ts      # Login API endpoint
│           ├── signup.ts     # Signup API endpoint
│           └── logout.ts     # Logout API endpoint
├── islands/
│   ├── LoginForm.tsx         # Interactive login form
│   └── SignupForm.tsx        # Interactive signup form
├── middleware/
│   └── auth.ts               # Authentication middleware
├── utils/
│   ├── db.ts                 # MongoDB connection
│   ├── user.ts               # User model and operations
│   ├── session.ts            # Session management utilities
│   └── state.ts              # Type-safe route definitions
├── static/
│   └── styles.css            # Tailwind CSS
├── docker-compose.yml        # MongoDB and Mongo Express setup
├── deno.json                 # Deno configuration
├── fresh.config.ts           # Fresh configuration
└── .env                      # Environment variables
```

## Environment Variables

Edit `.env` to configure your application:

```bash
# MongoDB connection string
MONGODB_URI=mongodb://admin:password123@localhost:27017

# Database name
MONGODB_DB=fresh_auth_app

# Session secret (change in production!)
SESSION_SECRET=change-this-to-a-random-secret-key-in-production
```

**Important**: Change `SESSION_SECRET` to a random string in production!

## Available Scripts

```bash
# Start development server with hot reload (Vite)
deno task dev

# Run type checking and linting
deno task check

# Build for production
deno task build

# Run production build
deno task start

# Update Fresh to latest version
deno task update
```

## Docker Commands

```bash
# Start MongoDB
docker-compose up -d

# Stop MongoDB
docker-compose down

# Stop and remove volumes (deletes all data)
docker-compose down -v

# View logs
docker-compose logs -f mongodb
```

## API Endpoints

### POST `/api/auth/signup`
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Signup successful"
}
```

### POST `/api/auth/login`
Login with existing credentials

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Login successful"
}
```

### GET `/api/auth/logout`
Logout and clear session

**Response:** Redirects to home page

## Authentication Flow

1. **Signup**: User creates an account → Password is hashed with bcrypt → User stored in MongoDB
2. **Login**: User provides credentials → Password verified → Session token created and stored in HTTP-only cookie
3. **Protected Routes**: Middleware checks session cookie → Verifies token → Loads user data → Makes available to routes
4. **Logout**: Session cookie is cleared → User redirected to home page

## Adding Data Storage

To add your own data collections, follow this pattern:

1. Create a new collection in `utils/`:

```typescript
// utils/posts.ts
import { getDatabase } from "./db.ts";

export interface Post {
  _id?: ObjectId;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
}

export async function createPost(userId: string, title: string, content: string) {
  const db = await getDatabase();
  const posts = db.collection<Post>("posts");
  
  return await posts.insertOne({
    userId,
    title,
    content,
    createdAt: new Date(),
  });
}
```

2. Create API routes in `routes/api/`:

```typescript
// routes/api/posts/create.ts
import { Handlers } from "$fresh/server.ts";
import { createPost } from "../../../utils/posts.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    const { user } = ctx.state;
    if (!user) {
      return new Response(null, { status: 401 });
    }
    
    const { title, content } = await req.json();
    const post = await createPost(user._id, title, content);
    
    return Response.json({ post });
  },
};
```

## Security Notes

- Passwords are hashed using bcrypt before storage
- Session tokens are HMAC-signed to prevent tampering
- Cookies are HTTP-only, Secure, and SameSite=Lax
- Always use HTTPS in production
- Change `SESSION_SECRET` to a strong random value in production

## Development Tips

- MongoDB data persists in Docker volumes between restarts
- Use Mongo Express at `http://localhost:8081` to view/manage data
- Hot reload is enabled - changes to routes and islands reload automatically
- Check MongoDB logs: `docker-compose logs -f mongodb`

## Production Deployment

Before deploying to production:

1. Generate a strong session secret:
   ```bash
   openssl rand -base64 32
   ```

2. Update `.env` with production values:
   - Use a secure MongoDB connection string (MongoDB Atlas, etc.)
   - Set a strong `SESSION_SECRET`

3. Build the application:
   ```bash
   deno task build
   ```

4. Deploy to [Deno Deploy](https://deno.com/deploy) or your preferred platform

## Troubleshooting

### MongoDB Connection Issues

If you can't connect to MongoDB:

```bash
# Check if MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Port Already in Use

If port 8000 or 27017 is in use:

```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or change the port in dev.ts and main.ts
```

## License

MIT

## Contributing

Feel free to submit issues and pull requests!
