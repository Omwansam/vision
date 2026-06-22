const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const requestLogger = require('./middleware/logger.middleware');

const authRouter = require('./routes/auth.routes');
const userRouter = require('./routes/user.routes');
const siteRouter = require('./routes/site.routes');
const programRouter = require('./routes/program.routes');
const newsRouter = require('./routes/news.routes');
const galleryRouter = require('./routes/gallery.routes');
const impactRouter = require('./routes/impact.routes');
const transparencyRouter = require('./routes/transparency.routes');
const tenderRouter = require('./routes/tender.routes');
const formRouter = require('./routes/form.routes');
const donationRouter = require('./routes/donation.routes');
const partnerRouter = require('./routes/partner.routes');
const testimonialRouter = require('./routes/testimonial.routes');
const submissionRouter = require('./routes/submission.routes');
const notificationRouter = require('./routes/notification.routes');
const uploadRouter = require('./routes/upload.routes');

const app = express();

connectDB();

app.set('trust proxy', 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.FRONTEND_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

app.use('/favicon.ico', express.static(path.join(__dirname, 'public/favicon.svg')));
app.use('/favicon.svg', express.static(path.join(__dirname, 'public/favicon.svg')));
app.use('/branding', express.static(path.join(__dirname, 'public/branding')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Vision Mentors Group API',
    version: '1.0.0',
    docs: '/api/v1/health',
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VMG API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/site', siteRouter);
app.use('/api/v1/programs', programRouter);
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/gallery', galleryRouter);
app.use('/api/v1/impact', impactRouter);
app.use('/api/v1/transparency', transparencyRouter);
app.use('/api/v1/tenders', tenderRouter);
app.use('/api/v1/forms', formRouter);
app.use('/api/v1/donations', donationRouter);
app.use('/api/v1/partners', partnerRouter);
app.use('/api/v1/testimonials', testimonialRouter);
app.use('/api/v1/submissions', submissionRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/uploads', uploadRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

const port = config.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
