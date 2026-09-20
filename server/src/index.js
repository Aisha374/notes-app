require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./db');
const errorHandler = require('./middleware/errorHandler');

const folderRoutes = require('./routes/folders');
const noteRoutes = require('./routes/notes');
const shareRoutes = require('./routes/share');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/folders', folderRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/share', shareRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
      console.log('Closed out remaining connections.');
      process.exit(0);
    });
    
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer();
