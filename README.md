# DripQR - QR Code Generator & Analytics Platform
## Technical Documentation

### Overview
DripQR is a full-stack TypeScript application for generating, managing, and analyzing QR codes. It provides real-time analytics, URL management, and comprehensive tracking capabilities.

### Tech Stack
- **Backend**: Node.js/Express/TypeScript/MongoDB
- **Frontend**: React/TypeScript/Tailwind CSS
- **Key Libraries**: 
  - react-qr-code
  - lucide-react
  - axios
  - jsonwebtoken
  - mongoose

### Core Features

#### 1. Authentication System
- JWT-based authentication
- Protected routes using middleware
- User registration and login
- Token refresh mechanism
- Session management

#### 2. QR Code Management
- Generation with custom URLs
- Unique identifier system
- URL history tracking
- Dynamic URL updates
- Bulk operations support
- List and detail views

#### 3. Analytics Engine
- Real-time scan tracking
- IP address logging
- Device detection
- Geolocation tracking
- Usage statistics
- Visitor analytics

### Project Structure
```
/backend
├── src/
│   ├── controllers/     # Business logic
│   │   ├── authController.ts    # Authentication logic
│   │   ├── qrController.ts      # QR code operations
│   │   └── analyticsController.ts # Analytics processing
│   ├── middleware/      # Auth & validation
│   │   └── auth.ts     # JWT validation & route protection
│   ├── models/         # Database schemas
│   │   ├── User.ts     # User model & methods
│   │   └── QRCode.ts   # QR code schema & tracking
│   ├── routes/         # API endpoints
│   │   ├── authRoutes.ts # Authentication routes
│   │   └── qrRoutes.ts  # QR code management routes
│   ├── types/          # TypeScript definitions
│   │   ├── express.d.ts # Express type extensions
│   │   ├── qr.d.ts      # QR code related types
│   │   └── user.d.ts    # User related types
│   ├── utils/          # Helper functions
│   │   └── geoLocation.ts # Location processing
│   ├── app.ts          # Express app configuration
│   └── index.ts        # Application entry point
```
### Frontend Architecture

#### Component Structure
```typescript
/frontend
├── src/
│   ├── components/
│   │   ├── QRCodeGeneration.tsx  // QR code creation form
│   │   └── QRAnalytics.tsx      // Analytics visualization
│   ├── pages/
│   │   ├── QRCodeList/          // List view of all QR codes
│   │   └── QRCodeDetails/       // Individual QR code view
│   ├── auth/
│   │   ├── LoginForm.tsx        // Login functionality
│   │   └── RegisterForm.tsx     // Registration form
│   ├── common/
│   │   └── ProtectedRoute.tsx   // Route protection HOC
│   ├── utils/
│   │   └── axios.ts             // API client configuration
│   ├── context/
│   │   └── AuthContext.tsx      // Authentication state
```


### API Endpoints

#### Authentication
```typescript
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

#### QR Code Management
```typescript
POST /api/qr/generate
GET /api/qr/list
GET /api/qr/:id
PUT /api/qr/:id/url
DELETE /api/qr/:id
```

#### Analytics
```typescript
GET /api/qr/:id/analytics
GET /api/qr/:id/scans
GET /api/qr/stats/global
```

### Data Models

#### User Schema
```typescript
interface IUser {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}
```

#### QR Code Schema
```typescript
interface IQRCode {
  user: mongoose.Types.ObjectId;
  targetUrl: string;
  currentUrl: string;
  customIdentifier?: string;
  uniqueIdentifier: string;
  urlHistory: Array<{
    url: string;
    changedAt: Date;
  }>;
  scans: Array<{
    timestamp: Date;
    ipAddress?: string;
    deviceInfo?: string;
    location?: {
      country?: string;
      city?: string;
    };
  }>;
  createdAt: Date;
}
```

### Security Implementation

#### Authentication Flow
1. User registration with email validation
2. Password hashing using bcrypt
3. JWT token generation
4. Token validation middleware
5. Protected route implementation

#### Request Validation
- Input sanitization
- Type validation
- Request body validation
- URL validation
- Custom identifier validation

### Development Setup

#### Prerequisites
- Node.js >= 14
- MongoDB >= 4.4
- TypeScript >= 4.5

#### Environment Variables
```env
# Backend
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000

# Frontend
REACT_APP_API_URL=http://localhost:8000/api
```

#### Installation
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

### Testing

#### Implemented Tests
- API endpoint testing
- Authentication flow verification
- Analytics accuracy validation
- QR code functionality testing
- Type checking validation

#### Running Tests
```bash
# Backend tests
npm run test

# Frontend tests
npm run test
```

#### Production Considerations
- Environment variable management
- CORS configuration
- MongoDB indexing
- Error handling
- Logging setup

### Performance Optimizations

#### Implemented
- Database indexing
- Request caching
- Efficient query patterns
- Type safety checks
- Error boundary implementation

#### Monitoring
- Request timing
- Database performance
- Error tracking
- Analytics accuracy

### Future Enhancements
-   axios configuration with interceptors
-   Authentication token management
-   QR code download functionality
-   URL validation logic
-   Error handling patterns
-   State management approach

1. Deployment 
- Set up neetoDeploy
- Configure environment variables 
- Set up MongoDB production database  
- Set up domain/SSL 
2. Analytics Enhancement 
- Add visual charts/graphs 
- Implement geographic visualization 
- Add device breakdown charts 
- Create traffic pattern analysis 
- Real-time scan updates 
3. UI/UX Improvements 
- Add loading states 
- Implement success notifications 
- Add error handling toasts
- Improve mobile responsiveness 
- Add dark mode support 
4. Additional Features 
- Bulk QR code generation 
- QR code design customization 
- Export analytics data 
- Team collaboration features 
- API documentation 
5. Testing & Performance 
- Add unit tests 
- Implement E2E tests 
- Performance optimization 
- Load testing 
- Security audit


### Critical Implementations

#### API Client Setup
```typescript
// /frontend/src/utils/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://ss6vpl-8000.csb.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### QR Code Download Implementation
```typescript
const handleDownload = () => {
  const svg = document.querySelector('svg');
  if (!svg) {
    console.error('SVG element not found');
    return;
  }

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Canvas context not available');
    return;
  }

  const img = new Image();
  img.onload = () => {
    try {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-code-${uniqueIdentifier}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    } catch (error) {
      console.error('Error generating QR code image:', error);
    }
  };

  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
};
```

### Development Environment

#### CodeSandbox Configuration
- Backend URL: https://ss6vpl-8000.csb.app
- Frontend URL: https://ss6vpl-5173.csb.app
- Environment Variables Setup in CodeSandbox:
  ```
  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  ```

#### Common Development Issues
1. 404 Error on QR Generation
   - Solution: Check API endpoint configuration
   - Verify baseURL in axios setup

2. QR Code Download Issues
   - Solution: Add proper error handling for SVG conversion
   - Check browser compatibility

3. Authentication Token Issues
   - Solution: Verify token storage
   - Check token expiration handling

### Testing Procedures

#### API Testing
```bash
# Auth Endpoints
curl -X POST https://ss6vpl-8000.csb.app/api/auth/register \
-H "Content-Type: application/json" \
-d '{"name":"test","email":"test@example.com","password":"password123"}'

# QR Code Generation
curl -X POST https://ss6vpl-8000.csb.app/api/qr/generate \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_TOKEN" \
-d '{"targetUrl":"https://example.com"}'
```

### Type Definitions

#### QR Code Types
```typescript
// /backend/src/types/qr.d.ts
interface QRCodeData {
  uniqueIdentifier: string;
  targetUrl: string;
  currentUrl: string;
  customIdentifier?: string;
  urlHistory: UrlHistory[];
  scans: ScanData[];
}

interface UrlHistory {
  url: string;
  changedAt: Date;
}

interface ScanData {
  timestamp: Date;
  ipAddress?: string;
  deviceInfo?: string;
  location?: {
    country?: string;
    city?: string;
  };
}
```

### Error Handling

#### Frontend Error Handling
```typescript
try {
  const response = await api.post("/qr/generate", {
    targetUrl: url,
    customIdentifier: customId || undefined,
  });
  // Handle success
} catch (err: any) {
  if (err.response?.status === 401) {
    // Handle authentication error
    navigate('/login');
  } else {
    // Handle other errors
    setError(err.response?.data?.message || "Failed to generate QR code");
  }
}
```

### Deployment Considerations

#### Environment Setup
```env
# Backend (.env)
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://your-frontend-url.neetodeploy.com

# Frontend (.env)
REACT_APP_API_URL=https://your-backend-url.neetodeploy.com/api
```
