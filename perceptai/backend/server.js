const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve CV assets (images, etc.) directly from the source folder
const CV_DIR = path.join(__dirname, '../src/components/Projects/ComputerVision');
app.use('/cv-assets', express.static(CV_DIR));

// Multer setup for in-memory handling of uploaded files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file
    files: 5,
  },
});

// Track running project processes by name
const runningProcesses = new Map(); // projectName -> pid

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/perceptai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const projectRoutes = require('./routes/projects');
const resourceRoutes = require('./routes/resources');
const collaboratorRoutes = require('./routes/collaborators');
const newsletterRoutes = require('./routes/newsletter');

// Use routes
app.use('/api/projects', projectRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/collaborator', collaboratorRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Project execution endpoint
app.post('/run/:projectName', async (req, res) => {
  try {
    const { projectName } = req.params;
    const { spawn } = require('child_process');
    
    const projectPaths = {
      'hand-gesture-detection': path.join(__dirname, '../src/components/Projects/ComputerVision/main.py'),
      'face-detection': path.join(__dirname, '../src/components/Projects/ComputerVision/face_detection.py'),
      'object-detection': path.join(__dirname, '../src/components/Projects/ComputerVision/object_detection.py'),
    };

    let projectPath = projectPaths[projectName];
    // Fallback: dynamically resolve any .py file in CV directory by base name
    if (!projectPath) {
      const fs = require('fs');
      const candidate = path.join(CV_DIR, `${projectName}.py`);
      if (fs.existsSync(candidate)) {
        projectPath = candidate;
      }
    }
    if (!projectPath) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // If already running, stop previous first
    if (runningProcesses.has(projectName)) {
      const existingPid = runningProcesses.get(projectName);
      try {
        if (process.platform === 'win32') {
          require('child_process').execSync(`taskkill /PID ${existingPid} /T /F`);
        } else {
          process.kill(-existingPid);
        }
      } catch (_) {}
      runningProcesses.delete(projectName);
    }

    // Start the Python process and return immediately so UI does not hang
    const pythonProcess = spawn('python', [projectPath], { detached: true, stdio: 'ignore' });
    const pid = pythonProcess.pid;
    runningProcesses.set(projectName, pid);

    pythonProcess.once('error', (error) => {
      runningProcesses.delete(projectName);
      try { res.status(500).json({ error: `Failed to start project: ${error.message}` }); } catch {}
    });

    pythonProcess.once('spawn', () => {
      try { res.json({ message: `Project ${projectName} started`, pid }); } catch {}
      try { pythonProcess.unref(); } catch {}
    });

  } catch (error) {
    console.error('Error executing project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stop a running project
app.post('/stop/:projectName', (req, res) => {
  const { projectName } = req.params;
  const pid = runningProcesses.get(projectName);
  if (!pid) {
    return res.status(404).json({ error: 'Project is not running' });
  }
  try {
    if (process.platform === 'win32') {
      require('child_process').execSync(`taskkill /PID ${pid} /T /F`);
    } else {
      process.kill(-pid);
    }
    runningProcesses.delete(projectName);
    return res.json({ message: `Project ${projectName} stopped` });
  } catch (error) {
    return res.status(500).json({ error: `Failed to stop project: ${error.message}` });
  }
});

// List running processes
app.get('/status/processes', (_req, res) => {
  res.json({ running: Array.from(runningProcesses.entries()).map(([name, pid]) => ({ name, pid })) });
});

// Get available projects
app.get('/', async (req, res) => {
  try {
    const Project = require('./models/Project');
    const projects = await Project.find();
    res.json({ projects: projects.map(p => ({
      name: p.name,
      image: p.image,
      description: p.description,
    })) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// List OpenCV Python projects by scanning the folder
app.get('/opencv/projects', async (_req, res) => {
  try {
    const fs = require('fs');
    const entries = fs.readdirSync(CV_DIR).filter(f => f.toLowerCase().endsWith('.py'));
    const projects = entries.map(file => {
      const base = file.replace(/\.py$/i, '');
      const possibleImages = [`${base}.png`, `${base}.jpg`, `${base}.jpeg`, `${base}.webp`];
      const imageFile = possibleImages.find(img => fs.existsSync(path.join(CV_DIR, img)));
      const descFile = path.join(CV_DIR, `${base}.txt`);
      let description = '';
      try {
        if (fs.existsSync(descFile)) {
          description = fs.readFileSync(descFile, 'utf-8').trim();
        }
      } catch (_) {}
      return {
        name: base,
        image: imageFile ? `/cv-assets/${imageFile}` : null,
        description,
      };
    });
    res.json({ projects });
  } catch (error) {
    console.error('Error listing OpenCV projects:', error);
    res.status(500).json({ error: 'Failed to list OpenCV projects' });
  }
});

// Submit a new OpenCV project (python + optional image/description)
app.post('/opencv/project/submit', upload.any(), async (req, res) => {
  try {
    const rawName = (req.body.project_name || '').toString().trim();
    if (!rawName) {
      return res.status(400).json({ error: 'project_name is required' });
    }
    // Sanitize project name to safe filename
    const name = rawName
      .toLowerCase()
      .replace(/[^a-z0-9-_\s]/g, '')
      .replace(/\s+/g, '-');
    if (!name) {
      return res.status(400).json({ error: 'Invalid project name' });
    }

    const mainTarget = path.join(CV_DIR, `${name}.py`);
    const descTarget = path.join(CV_DIR, `${name}.txt`);
    // Prefer PNG by default
    const imageTargetPng = path.join(CV_DIR, `${name}.png`);
    const imageTargetJpg = path.join(CV_DIR, `${name}.jpg`);

    // Do not overwrite existing project
    if (fs.existsSync(mainTarget)) {
      return res.status(409).json({ error: 'A project with this name already exists' });
    }

    // Extract files by fieldname
    const files = new Map();
    for (const f of req.files || []) {
      files.set(f.fieldname, f);
    }

    const mainFile = files.get('main.py');
    if (!mainFile) {
      return res.status(400).json({ error: "main.py file is required (fieldname 'main.py')" });
    }

    // Write main.py
    fs.writeFileSync(mainTarget, mainFile.buffer);

    // Optional: image
    const imageFile = files.get('image.png') || files.get('image.jpg') || files.get('image.jpeg');
    if (imageFile) {
      const mimetype = imageFile.mimetype || '';
      if (mimetype.includes('png')) {
        fs.writeFileSync(imageTargetPng, imageFile.buffer);
      } else {
        fs.writeFileSync(imageTargetJpg, imageFile.buffer);
      }
    }

    // Optional: description
    const descFile = files.get('description.txt');
    if (descFile) {
      fs.writeFileSync(descTarget, descFile.buffer);
    }

    return res.status(201).json({
      message: 'Project submitted successfully',
      project: {
        name,
        image: fs.existsSync(imageTargetPng)
          ? `/cv-assets/${name}.png`
          : fs.existsSync(imageTargetJpg)
            ? `/cv-assets/${name}.jpg`
            : null,
        description: fs.existsSync(descTarget)
          ? fs.readFileSync(descTarget, 'utf-8').trim()
          : '',
      },
    });
  } catch (error) {
    console.error('Error submitting OpenCV project:', error);
    return res.status(500).json({ error: 'Failed to submit project' });
  }
});

// Keep alive endpoint
app.get('/keep-alive', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
