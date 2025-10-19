# JanSetu - Smart Governance Platform

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JanSetu
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd Server
   npm install
   
   # Install client dependencies
   cd ../Client
   npm install
   ```

3. **Configure environment variables**
   - In the `Server` directory, ensure the `env` file exists with the following variables:
     ```
     PORT=8000
     MONGODB_URI=mongodb://localhost:27017/jansetu
     ACCESS_TOKEN_SECRET=your_jwt_secret_key_here_change_in_production
     CORS=http://localhost:5173
     ```

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - If using a different MongoDB URI, update the `MONGODB_URI` in the `env` file

5. **Run the application**
   ```bash
   # Start the server (from Server directory)
   cd Server
   npm start
   
   # Start the client (from Client directory, in a new terminal)
   cd Client
   npm run dev
   ```

## Testing Signup Functionality

### Manual Testing
1. Open your browser and navigate to `http://localhost:5173`
2. Click on "Sign Up" or navigate to `/signup`
3. Fill in the form with valid data:
   - Name: Your full name
   - Email: A valid email address
   - Password: At least 6 characters
   - Phone: Aadhar number (12 digits)
   - Location: Click "Get My Location" or enter coordinates manually
4. Submit the form
5. You should see a success message and be redirected to the login page

### Test Data Examples
- **Valid coordinates for testing:**
  - Delhi: Longitude: 77.2090, Latitude: 28.7041
  - Mumbai: Longitude: 72.8777, Latitude: 19.0760
  - Bangalore: Longitude: 77.5946, Latitude: 12.9716

### Common Issues and Solutions

1. **"User already exists" error**
   - Use a different email address for testing

2. **"Network error"**
   - Ensure the server is running on port 8000
   - Check if MongoDB is running
   - Verify the API endpoint in `Client/src/ApiUri.ts`

3. **"Invalid coordinates" error**
   - Make sure longitude is between -180 and 180
   - Make sure latitude is between -90 and 90
   - Use the "Get My Location" button for automatic coordinates

4. **CORS errors**
   - Ensure the CORS configuration in `Server/src/app.js` matches your client URL
   - Check that the `env` file has the correct CORS origin

## Features

### User Signup
- ✅ Form validation (client-side and server-side)
- ✅ Password hashing
- ✅ Email uniqueness check
- ✅ Location coordinates validation
- ✅ Automatic location detection
- ✅ Loading states and error handling
- ✅ Success/error notifications

### Security Features
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Input validation and sanitization

## API Endpoints

### User Management
- `POST /api/v1/users/signupUser` - User registration
- `POST /api/v1/users/loginUser` - User login
- `POST /api/v1/users/logout` - User logout

### Problem Management
- `POST /api/v1/users/createProblem/:userId` - Create problem report
- `GET /api/v1/users/getAllproblems` - Get all problems
- `DELETE /api/v1/users/problem/:problemId/user/:userId` - Delete problem

### Comments
- `POST /api/v1/users/addComment/:problemId/:userId` - Add comment
- `DELETE /api/v1/users/comments/:commentId/:userId` - Delete comment
- `GET /api/v1/users/getComment/:problemId` - Get comments for problem

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String,
  location: {
    type: String (enum: ['Point']),
    coordinates: [Number, Number] // [longitude, latitude]
  },
  address: String,
  createdAt: Date
}
```

## Development

### Project Structure
```
JanSetu/
├── Client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ApiUri.ts
└── Server/          # Node.js backend
    ├── src/
    │   ├── controller/
    │   ├── models/
    │   ├── routes/
    │   └── app.js
    └── env
```

### Technologies Used
- **Frontend:** React, TypeScript, Tailwind CSS, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **Validation:** Client-side and server-side validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
