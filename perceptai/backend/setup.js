const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 PerceptAI Backend Setup');
console.log('============================\n');

// Check if Node.js is installed
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v16 or higher.');
  process.exit(1);
}

// Check if MongoDB is running
async function checkMongoDB() {
  try {
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://127.0.0.1:27017/perceptai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB is running and accessible');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ MongoDB is not running. Please start MongoDB first.');
    console.log('   On Windows: net start MongoDB');
    console.log('   On macOS/Linux: sudo systemctl start mongod');
    process.exit(1);
  }
}

// Check if Python is installed
function checkPython() {
  try {
    const pythonVersion = execSync('python --version', { encoding: 'utf8' });
    console.log(`✅ Python: ${pythonVersion.trim()}`);
  } catch (error) {
    try {
      const python3Version = execSync('python3 --version', { encoding: 'utf8' });
      console.log(`✅ Python3: ${python3Version.trim()}`);
    } catch (error) {
      console.error('❌ Python is not installed. Please install Python for project execution.');
      process.exit(1);
    }
  }
}

// Check if required Python packages are installed
function checkPythonPackages() {
  const requiredPackages = ['opencv-python', 'mediapipe', 'numpy'];
  
  console.log('\n📦 Checking Python packages...');
  
  for (const package of requiredPackages) {
    try {
      execSync(`python -c "import ${package.replace('-', '_')}"`, { stdio: 'ignore' });
      console.log(`✅ ${package} is installed`);
    } catch (error) {
      console.log(`⚠️  ${package} is not installed. Install with: pip install ${package}`);
    }
  }
}

// Create uploads directory
function createUploadsDirectory() {
  const uploadsDir = path.join(__dirname, 'uploads');
  const projectsDir = path.join(uploadsDir, 'projects');
  const resourcesDir = path.join(uploadsDir, 'resources');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
  }
  
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
    console.log('✅ Created projects uploads directory');
  }
  
  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
    console.log('✅ Created resources uploads directory');
  }
}

// Check if .env file exists
function checkEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('\n📝 Creating .env file...');
    const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/perceptai

# Email Configuration (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional: JWT Secret (if implementing authentication)
JWT_SECRET=your-jwt-secret-key

# Optional: CORS Origin (for production)
CORS_ORIGIN=http://localhost:5173
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
    console.log('   Please update the email credentials if you want newsletter functionality');
  } else {
    console.log('✅ .env file already exists');
  }
}

// Main setup function
async function setup() {
  try {
    console.log('🔍 Checking dependencies...\n');
    
    await checkMongoDB();
    checkPython();
    checkPythonPackages();
    
    console.log('\n📁 Setting up directories...');
    createUploadsDirectory();
    
    console.log('\n⚙️  Setting up configuration...');
    checkEnvFile();
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Seed the database: node seed.js');
    console.log('3. Start the server: npm run dev');
    console.log('4. The server will be available at: http://localhost:5000');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setup();




