const mongoose = require('mongoose');
const Project = require('./models/Project');
const Resource = require('./models/Resource');
const Collaborator = require('./models/Collaborator');
const Newsletter = require('./models/Newsletter');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/perceptai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB for seeding'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample projects data
const sampleProjects = [
  {
    name: 'hand-gesture-detection',
    title: 'Hand Gesture Detection',
    description: 'Real-time hand gesture recognition using OpenCV and MediaPipe. Detects left and right hand gestures with high accuracy.',
    category: 'Computer Vision',
    technologies: ['Python', 'OpenCV', 'MediaPipe', 'Computer Vision'],
    githubUrl: 'https://github.com/perceptai/hand-gesture-detection',
    liveUrl: 'https://demo.perceptai.com/hand-gesture',
    demoUrl: 'https://demo.perceptai.com/hand-gesture',
    codeUrl: 'https://github.com/perceptai/hand-gesture-detection',
    author: 'PerceptAI Team',
    authorId: 'perceptai-team',
    tags: ['computer-vision', 'opencv', 'mediapipe', 'gesture-recognition'],
    difficulty: 'Intermediate',
    estimatedTime: '2-3 hours',
    requirements: ['Python 3.8+', 'OpenCV', 'MediaPipe', 'Webcam'],
    instructions: 'Run the main.py file to start hand gesture detection. Press "q" to quit.',
    executable: true,
    pythonPath: '../src/components/Projects/ComputerVision/main.py',
    featured: true,
    likes: 45,
    views: 1200
  },
  {
    name: 'face-detection',
    title: 'Face Detection System',
    description: 'Advanced face detection and recognition system using deep learning models. Supports multiple faces and emotion detection.',
    category: 'Computer Vision',
    technologies: ['Python', 'OpenCV', 'TensorFlow', 'Deep Learning'],
    githubUrl: 'https://github.com/perceptai/face-detection',
    liveUrl: 'https://demo.perceptai.com/face-detection',
    demoUrl: 'https://demo.perceptai.com/face-detection',
    codeUrl: 'https://github.com/perceptai/face-detection',
    author: 'PerceptAI Team',
    authorId: 'perceptai-team',
    tags: ['computer-vision', 'face-detection', 'deep-learning', 'opencv'],
    difficulty: 'Advanced',
    estimatedTime: '4-5 hours',
    requirements: ['Python 3.8+', 'OpenCV', 'TensorFlow', 'Webcam'],
    instructions: 'Run the face_detection.py file to start face detection. Press "q" to quit.',
    executable: true,
    pythonPath: '../src/components/Projects/ComputerVision/face_detection.py',
    featured: true,
    likes: 32,
    views: 890
  },
  {
    name: 'object-detection',
    title: 'Real-time Object Detection',
    description: 'YOLO-based object detection system for real-time identification of multiple objects in video streams.',
    category: 'Computer Vision',
    technologies: ['Python', 'YOLO', 'OpenCV', 'Deep Learning'],
    githubUrl: 'https://github.com/perceptai/object-detection',
    liveUrl: 'https://demo.perceptai.com/object-detection',
    demoUrl: 'https://demo.perceptai.com/object-detection',
    codeUrl: 'https://github.com/perceptai/object-detection',
    author: 'PerceptAI Team',
    authorId: 'perceptai-team',
    tags: ['computer-vision', 'object-detection', 'yolo', 'deep-learning'],
    difficulty: 'Advanced',
    estimatedTime: '3-4 hours',
    requirements: ['Python 3.8+', 'YOLO', 'OpenCV', 'Webcam'],
    instructions: 'Run the object_detection.py file to start object detection. Press "q" to quit.',
    executable: true,
    pythonPath: '../src/components/Projects/ComputerVision/object_detection.py',
    featured: true,
    likes: 28,
    views: 750
  },
  {
    name: 'ai-chatbot',
    title: 'AI Chatbot with NLP',
    description: 'Intelligent chatbot powered by natural language processing and machine learning algorithms.',
    category: 'AI/ML',
    technologies: ['Python', 'NLTK', 'TensorFlow', 'NLP'],
    githubUrl: 'https://github.com/perceptai/ai-chatbot',
    liveUrl: 'https://demo.perceptai.com/ai-chatbot',
    demoUrl: 'https://demo.perceptai.com/ai-chatbot',
    codeUrl: 'https://github.com/perceptai/ai-chatbot',
    author: 'PerceptAI Team',
    authorId: 'perceptai-team',
    tags: ['ai', 'nlp', 'chatbot', 'machine-learning'],
    difficulty: 'Intermediate',
    estimatedTime: '3-4 hours',
    requirements: ['Python 3.8+', 'NLTK', 'TensorFlow'],
    instructions: 'Run the chatbot.py file to start the AI chatbot.',
    executable: false,
    featured: false,
    likes: 15,
    views: 420
  },
  {
    name: 'data-visualization',
    title: 'Interactive Data Visualization',
    description: 'Create beautiful and interactive data visualizations using modern web technologies.',
    category: 'Data Science',
    technologies: ['JavaScript', 'D3.js', 'React', 'Data Visualization'],
    githubUrl: 'https://github.com/perceptai/data-visualization',
    liveUrl: 'https://demo.perceptai.com/data-viz',
    demoUrl: 'https://demo.perceptai.com/data-viz',
    codeUrl: 'https://github.com/perceptai/data-visualization',
    author: 'PerceptAI Team',
    authorId: 'perceptai-team',
    tags: ['data-science', 'visualization', 'd3', 'react'],
    difficulty: 'Beginner',
    estimatedTime: '2-3 hours',
    requirements: ['Node.js', 'React', 'D3.js'],
    instructions: 'Run npm install and npm start to launch the visualization app.',
    executable: false,
    featured: false,
    likes: 22,
    views: 580
  }
];

// Sample resources data
const sampleResources = [
  {
    title: 'Complete OpenCV Tutorial',
    description: 'Comprehensive guide to OpenCV for computer vision projects. Covers image processing, video analysis, and real-time applications.',
    category: 'Tutorial',
    url: 'https://opencv.org/tutorials/',
    author: 'OpenCV Team',
    authorId: 'opencv-team',
    tags: ['opencv', 'computer-vision', 'tutorial'],
    difficulty: 'Intermediate',
    estimatedTime: '6-8 hours',
    language: 'Python',
    rating: 4.8,
    views: 2500,
    featured: true
  },
  {
    title: 'Machine Learning Fundamentals',
    description: 'Learn the basics of machine learning algorithms, from linear regression to neural networks.',
    category: 'Course',
    url: 'https://coursera.org/ml-course',
    author: 'Andrew Ng',
    authorId: 'andrew-ng',
    tags: ['machine-learning', 'algorithms', 'neural-networks'],
    difficulty: 'Intermediate',
    estimatedTime: '40-50 hours',
    language: 'Python',
    rating: 4.9,
    views: 1800,
    featured: true
  },
  {
    title: 'React for Beginners',
    description: 'Step-by-step guide to building modern web applications with React and TypeScript.',
    category: 'Tutorial',
    url: 'https://react.dev/learn',
    author: 'React Team',
    authorId: 'react-team',
    tags: ['react', 'javascript', 'typescript', 'web-development'],
    difficulty: 'Beginner',
    estimatedTime: '10-12 hours',
    language: 'JavaScript',
    rating: 4.7,
    views: 3200,
    featured: true
  },
  {
    title: 'Deep Learning with PyTorch',
    description: 'Comprehensive deep learning course using PyTorch framework for neural network development.',
    category: 'Course',
    url: 'https://pytorch.org/tutorials/',
    author: 'PyTorch Team',
    authorId: 'pytorch-team',
    tags: ['deep-learning', 'pytorch', 'neural-networks'],
    difficulty: 'Advanced',
    estimatedTime: '60-80 hours',
    language: 'Python',
    rating: 4.6,
    views: 1200,
    featured: false
  },
  {
    title: 'Data Science Handbook',
    description: 'Complete handbook covering data analysis, visualization, and machine learning techniques.',
    category: 'Book',
    url: 'https://jakevdp.github.io/PythonDataScienceHandbook/',
    author: 'Jake VanderPlas',
    authorId: 'jake-vanderplas',
    tags: ['data-science', 'python', 'pandas', 'matplotlib'],
    difficulty: 'Intermediate',
    estimatedTime: '30-40 hours',
    language: 'Python',
    rating: 4.8,
    views: 2100,
    featured: false
  }
];

// Sample collaborators data
const sampleCollaborators = [
  {
    projectId: 'hand-gesture-detection',
    projectName: 'Hand Gesture Detection',
    projectDescription: 'Real-time hand gesture recognition using OpenCV and MediaPipe. Detects left and right hand gestures with high accuracy.',
    projectCategory: 'Computer Vision',
    requiredSkills: ['Python', 'OpenCV', 'MediaPipe', 'Computer Vision'],
    projectOwner: 'PerceptAI Team',
    projectOwnerId: 'perceptai-team',
    projectOwnerEmail: 'team@perceptai.com',
    maxCollaborators: 3,
    deadline: new Date('2024-03-15'),
    budget: 'Unpaid',
    isPaid: false,
    location: 'Remote',
    remote: true,
    tags: ['computer-vision', 'opencv', 'mediapipe'],
    status: 'open'
  },
  {
    projectId: 'ai-chatbot',
    projectName: 'AI Chatbot with NLP',
    projectDescription: 'Intelligent chatbot powered by natural language processing and machine learning algorithms.',
    projectCategory: 'AI/ML',
    requiredSkills: ['Python', 'NLTK', 'TensorFlow', 'NLP'],
    projectOwner: 'PerceptAI Team',
    projectOwnerId: 'perceptai-team',
    projectOwnerEmail: 'team@perceptai.com',
    maxCollaborators: 4,
    deadline: new Date('2024-04-01'),
    budget: 'Unpaid',
    isPaid: false,
    location: 'Remote',
    remote: true,
    tags: ['ai', 'nlp', 'chatbot'],
    status: 'open'
  },
  {
    projectId: 'data-visualization',
    projectName: 'Interactive Data Visualization',
    projectDescription: 'Create beautiful and interactive data visualizations using modern web technologies.',
    projectCategory: 'Data Science',
    requiredSkills: ['JavaScript', 'D3.js', 'React', 'Data Visualization'],
    projectOwner: 'PerceptAI Team',
    projectOwnerId: 'perceptai-team',
    projectOwnerEmail: 'team@perceptai.com',
    maxCollaborators: 2,
    deadline: new Date('2024-02-28'),
    budget: 'Unpaid',
    isPaid: false,
    location: 'Remote',
    remote: true,
    tags: ['data-science', 'visualization', 'd3'],
    status: 'open'
  }
];

// Sample newsletter subscribers
const sampleSubscribers = [
  {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    subscribed: true,
    status: 'active',
    preferences: {
      projects: true,
      tutorials: true,
      news: true,
      events: true
    }
  },
  {
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    subscribed: true,
    status: 'active',
    preferences: {
      projects: true,
      tutorials: false,
      news: true,
      events: false
    }
  },
  {
    email: 'mike.wilson@example.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    subscribed: true,
    status: 'active',
    preferences: {
      projects: false,
      tutorials: true,
      news: true,
      events: true
    }
  }
];

// Seed function
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await Project.deleteMany({});
    await Resource.deleteMany({});
    await Collaborator.deleteMany({});
    await Newsletter.deleteMany({});

    console.log('Cleared existing data');

    // Insert sample projects
    const projects = await Project.insertMany(sampleProjects);
    console.log(`Inserted ${projects.length} projects`);

    // Insert sample resources
    const resources = await Resource.insertMany(sampleResources);
    console.log(`Inserted ${resources.length} resources`);

    // Insert sample collaborators
    const collaborators = await Collaborator.insertMany(sampleCollaborators);
    console.log(`Inserted ${collaborators.length} collaboration projects`);

    // Insert sample newsletter subscribers
    const subscribers = await Newsletter.insertMany(sampleSubscribers);
    console.log(`Inserted ${subscribers.length} newsletter subscribers`);

    console.log('Database seeding completed successfully!');
    console.log('\nSample data summary:');
    console.log(`- Projects: ${projects.length}`);
    console.log(`- Resources: ${resources.length}`);
    console.log(`- Collaboration Projects: ${collaborators.length}`);
    console.log(`- Newsletter Subscribers: ${subscribers.length}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();




