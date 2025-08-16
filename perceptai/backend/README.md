# PerceptAI Backend Server

A Node.js/Express backend server for the PerceptAI project execution platform. This server handles project management, resource sharing, collaboration, and newsletter functionality.

## Features

- **Project Management**: CRUD operations for AI/ML projects
- **Project Execution**: Run Python scripts and computer vision projects
- **Resource Sharing**: Learning resources and tutorials
- **Collaboration System**: Project recruitment and team formation
- **Newsletter Management**: Email subscription and distribution
- **File Upload**: Image uploads for projects and resources
- **Real-time Communication**: Socket.io integration

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Python (for project execution)

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd PerceptAI/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/perceptai
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

5. **Seed the database:**
   ```bash
   node seed.js
   ```

6. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/like` - Like a project
- `GET /api/projects/featured/list` - Get featured projects
- `GET /api/projects/category/:category` - Get projects by category

### Resources

- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create new resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource
- `POST /api/resources/:id/review` - Add review to resource
- `GET /api/resources/featured/list` - Get featured resources
- `GET /api/resources/category/:category` - Get resources by category

### Collaboration

- `GET /api/collaborator` - Get all collaboration projects
- `GET /api/collaborator/:id` - Get collaboration project by ID
- `POST /api/collaborator` - Create new collaboration project
- `PUT /api/collaborator/:id` - Update collaboration project
- `DELETE /api/collaborator/:id` - Delete collaboration project
- `POST /api/collaborator/:id/apply` - Apply to collaboration project
- `PUT /api/collaborator/:id/applications/:applicationId` - Update application status
- `GET /api/collaborator/open/list` - Get open collaboration projects
- `GET /api/collaborator/category/:category` - Get collaboration projects by category

### Newsletter

- `GET /api/newsletter/emails` - Get all subscribers
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter
- `POST /api/newsletter/send` - Send newsletter
- `GET /api/newsletter/stats` - Get newsletter statistics
- `PUT /api/newsletter/preferences/:email` - Update subscriber preferences
- `DELETE /api/newsletter/subscriber/:email` - Delete subscriber

### Project Execution

- `POST /run/:projectName` - Execute a project
- `GET /` - Get available projects
- `GET /keep-alive` - Server health check

## Database Models

### Project
- Basic info (name, title, description)
- Category and technologies
- URLs (GitHub, live, demo, code)
- Author information
- Tags and difficulty level
- Execution settings
- Statistics (likes, views)

### Resource
- Title and description
- Category and URL
- Author information
- Tags and difficulty
- Rating and reviews
- Statistics (views)

### Collaborator
- Project information
- Required skills
- Project owner details
- Application management
- Status tracking

### Newsletter
- Subscriber information
- Email preferences
- Subscription status
- Statistics tracking

## Project Execution

The server can execute Python projects using the `child_process` module. Projects are mapped by name to their Python file paths:

```javascript
const projectPaths = {
  'hand-gesture-detection': path.join(__dirname, '../src/components/Projects/ComputerVision/main.py'),
  'face-detection': path.join(__dirname, '../src/components/Projects/ComputerVision/face_detection.py'),
  'object-detection': path.join(__dirname, '../src/components/Projects/ComputerVision/object_detection.py'),
};
```

## File Upload

The server supports image uploads for projects and resources using Multer:

- **Supported formats**: JPEG, JPG, PNG, GIF, WebP
- **File size limit**: 5MB
- **Storage**: Local file system in `uploads/` directory

## Socket.io

Real-time communication is handled with Socket.io for:
- Live chat functionality
- Real-time project updates
- Collaboration notifications

## Error Handling

The server includes comprehensive error handling:
- Database connection errors
- File upload validation
- Project execution errors
- Email sending failures

## Security

- CORS configuration for frontend communication
- Input validation and sanitization
- File upload restrictions
- Error message sanitization

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node seed.js` - Seed database with sample data

### Directory Structure

```
backend/
├── models/          # MongoDB schemas
├── routes/          # API route handlers
├── uploads/         # File uploads
├── server.js        # Main server file
├── seed.js          # Database seeding
├── package.json     # Dependencies
└── README.md        # This file
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in server.js

2. **Project Execution Fails**
   - Verify Python is installed
   - Check Python file paths
   - Ensure required Python packages are installed

3. **File Upload Issues**
   - Check uploads directory permissions
   - Verify file size limits
   - Ensure supported file formats

4. **Email Not Sending**
   - Configure email credentials in .env
   - Check email service settings
   - Verify network connectivity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details




