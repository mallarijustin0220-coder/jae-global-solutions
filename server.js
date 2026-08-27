// ==========================================================================
// JAE GLOBAL SOLUTIONS - SECURE MAIN SERVER
// ==========================================================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Import Chat Model
let ChatMessage;
try {
  ChatMessage = require('./models/ChatMessage');
} catch (e) {
  console.warn('⚠️ models/ChatMessage.js not found. Using in-memory mode.');
}

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jae_global';

// Cloudflare Turnstile Keys
const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || '0x4AAAAAAAEaNq9BoyglfDL_q';
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '0x4AAAAAAAEAn3X2k-p3a4R83K7v32sB_iE';

// ==========================================================================
// MONGODB CONNECTION WITH FAST TIMEOUT & FALLBACK
// ==========================================================================
mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => console.log('✅ Connected to MongoDB Database'))
  .catch(() => console.warn('⚠️ Local MongoDB not running. Running in-memory storage fallback.'));

// In-Memory Storage Fallback if DB is disconnected
const inMemoryMessages = [];

// ==========================================================================
// SECURITY & BODY PARSING MIDDLEWARE
// ==========================================================================

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many requests sent from this IP. Please try again after 15 minutes.',
});

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));

// ==========================================================================
// VIEW ENGINE & STATIC ASSETS
// ==========================================================================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================================================
// PAGE ROUTES
// ==========================================================================

app.get('/', (req, res) => res.render('index', { pageTitle: 'Home - JAE Global Solutions' }));
app.get('/about', (req, res) => res.render('about', { pageTitle: 'About Us - JAE Global Solutions' }));
app.get('/services', (req, res) => res.render('services', { pageTitle: 'Solutions - JAE Global Solutions' }));
app.get('/why-jae', (req, res) => res.render('why-jae', { pageTitle: 'Why JAE - JAE Global Solutions' }));
app.get('/culture', (req, res) => res.render('culture', { pageTitle: 'Culture - JAE Global Solutions' }));
app.get('/how-it-works', (req, res) => res.render('how-it-works', { pageTitle: 'How It Works - JAE Global Solutions' }));
app.get('/careers', (req, res) => res.render('careers', { pageTitle: 'Careers - JAE Global Solutions' }));
app.get('/reviews', (req, res) => res.render('reviews', { pageTitle: 'Reviews - JAE Global Solutions' }));
app.get('/faq', (req, res) => res.render('faq', { pageTitle: 'FAQ - JAE Global Solutions' }));
app.get('/pricing', (req, res) => res.render('pricing', { pageTitle: 'Pricing - JAE Global Solutions' }));
app.get('/privacy', (req, res) => res.render('privacy', { pageTitle: 'Privacy Policy - JAE Global Solutions' }));
app.get('/terms', (req, res) => res.render('terms', { pageTitle: 'Terms of Service - JAE Global Solutions' }));

// GET Contact Page Route
app.get('/contact', (req, res) => {
  const selectedSpecialist = req.query.specialist || '';
  const success = req.query.success === 'true';

  res.render('contact', { 
    pageTitle: 'Contact Us - JAE Global Solutions', 
    successMsg: success ? 'Thank you! Your staffing request has been sent successfully. We will respond within 24 hours.' : null,
    errorMsg: null,
    selectedSpecialist,
    turnstileSiteKey: TURNSTILE_SITE_KEY
  });
});

// POST Route: Process Contact Form Submission with Cloudflare Turnstile Verification
app.post('/contact', contactLimiter, async (req, res) => {
  const { fullName, companyName, businessEmail, description, website_trap } = req.body;
  const turnstileToken = req.body['cf-turnstile-response'];

  // 1. Honeypot check (silently drop bot submissions)
  if (website_trap) {
    console.warn('🤖 Spam bot detected via honeypot.');
    return res.redirect('/contact?success=true');
  }

  // 2. Check if Turnstile token exists
  if (!turnstileToken) {
    return res.render('contact', { 
      pageTitle: 'Contact Us - JAE Global Solutions',
      successMsg: null,
      errorMsg: 'Please complete the Cloudflare verification challenge.',
      selectedSpecialist: '',
      turnstileSiteKey: TURNSTILE_SITE_KEY
    });
  }

  // 3. Verify Token with Cloudflare API
  try {
    const remoteIp = req.ip || req.headers['x-forwarded-for'];
    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', turnstileToken);
    if (remoteIp) formData.append('remoteip', remoteIp);

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      console.warn('⚠️ Turnstile verification failed:', verifyData['error-codes']);
      return res.render('contact', { 
        pageTitle: 'Contact Us - JAE Global Solutions',
        successMsg: null,
        errorMsg: 'Cloudflare verification failed. Please check the challenge box and try again.',
        selectedSpecialist: '',
        turnstileSiteKey: TURNSTILE_SITE_KEY
      });
    }
  } catch (err) {
    console.error('Turnstile Verification Error:', err);
    return res.render('contact', {
      pageTitle: 'Contact Us - JAE Global Solutions',
      successMsg: null,
      errorMsg: 'Unable to verify challenge at this moment. Please try again.',
      selectedSpecialist: '',
      turnstileSiteKey: TURNSTILE_SITE_KEY
    });
  }

  // 4. Format selected services
  let serviceRequired = req.body.serviceRequired;
  if (Array.isArray(serviceRequired)) {
    serviceRequired = serviceRequired.join(', ');
  } else if (!serviceRequired) {
    serviceRequired = 'None Selected';
  }

  // 5. Dispatch Email via Nodemailer
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"${fullName}" <${process.env.EMAIL_USER}>`,
      to: 'admin@jaeglobalsolutions.com',
      replyTo: businessEmail,
      subject: `New Lead: ${fullName} (${companyName || 'N/A'})`,
      html: `
        <h2>New Contact Inquiry - JAE Global Solutions</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
        <p><strong>Business Email:</strong> ${businessEmail}</p>
        <p><strong>Services Required:</strong> ${serviceRequired}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f4f4f4; padding: 10px; border-left: 4px solid #38BDF8;">
          ${description}
        </blockquote>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.redirect('/contact?success=true');

  } catch (error) {
    console.error('Email Dispatch Error:', error);
    res.render('contact', { 
      pageTitle: 'Contact Us - JAE Global Solutions',
      successMsg: null,
      errorMsg: 'There was an issue delivering your message. Please email us directly at admin@jaeglobalsolutions.com.',
      selectedSpecialist: '',
      turnstileSiteKey: TURNSTILE_SITE_KEY
    });
  }
});

// ==========================================================================
// CHAT WIDGET & ADMIN DASHBOARD ROUTES
// ==========================================================================

// 1. CLIENT API: Receive message from Chat Widget
app.post('/api/chat/send', async (req, res) => {
  try {
    const { sessionId, clientName, clientEmail, message } = req.body;

    const msgData = {
      sessionId: sessionId || 'session_' + Date.now(),
      clientName: clientName || 'Guest Visitor',
      clientEmail: clientEmail || 'visitor@jaeglobal.com',
      message: message || '',
      sender: 'client',
      status: 'unread',
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1 && ChatMessage) {
      await new ChatMessage(msgData).save();
    } else {
      inMemoryMessages.push(msgData);
    }

    return res.status(200).json({ success: true, message: 'Message delivered to admin!' });
  } catch (err) {
    console.error('Chat Send Error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 2. ADMIN API: Poll incoming messages JSON
app.get('/api/chat/messages', async (req, res) => {
  try {
    let messages = [];
    if (mongoose.connection.readyState === 1 && ChatMessage) {
      messages = await ChatMessage.find().sort({ createdAt: -1 }).lean().exec();
    } else {
      messages = [...inMemoryMessages].sort((a, b) => b.createdAt - a.createdAt);
    }
    return res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error('Fetch Messages Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve messages' });
  }
});

// 3. ADMIN DASHBOARD ROUTE
app.get('/admin/chat', async (req, res) => {
  try {
    let messages = [];

    if (mongoose.connection.readyState === 1 && ChatMessage) {
      messages = await ChatMessage.find().sort({ createdAt: -1 }).lean().exec();
    } else {
      messages = [...inMemoryMessages].sort((a, b) => b.createdAt - a.createdAt);
    }

    const threads = {};
    messages.forEach((msg) => {
      const emailKey = msg.clientEmail || 'visitor@jaeglobal.com';
      if (!threads[emailKey]) {
        threads[emailKey] = {
          clientName: msg.clientName || 'Guest Client',
          email: emailKey,
          lastUpdated: msg.createdAt,
          unreadCount: 0,
          messages: []
        };
      }
      threads[emailKey].messages.push(msg);
      if (msg.sender === 'client' && msg.status === 'unread') {
        threads[emailKey].unreadCount += 1;
      }
    });

    const renderData = {
      pageTitle: 'Admin Chat Dashboard - JAE Global Solutions',
      threads: Object.values(threads)
    };

    res.render('admin/chat', renderData, (err, html) => {
      if (!err) return res.send(html);
      res.render('chat', renderData);
    });

  } catch (err) {
    console.error('Admin Panel Route Error:', err);
    res.status(500).send('Error loading admin chat panel');
  }
});

// 4. ADMIN API: Submit reply to client
app.post('/api/admin/reply', async (req, res) => {
  try {
    const { clientEmail, replyMessage } = req.body;

    if (!clientEmail || !replyMessage) {
      return res.status(400).json({ success: false, error: 'Missing parameters.' });
    }

    const replyData = {
      sessionId: 'admin_reply',
      clientName: 'Admin Support',
      clientEmail,
      message: replyMessage,
      sender: 'admin',
      status: 'replied',
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1 && ChatMessage) {
      await new ChatMessage(replyData).save();
      await ChatMessage.updateMany({ clientEmail, sender: 'client' }, { status: 'read' });
    } else {
      inMemoryMessages.push(replyData);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Admin Reply Error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// 5. CLIENT API: Poll for new admin replies
app.get('/api/chat/replies/:email', async (req, res) => {
  try {
    let replies = [];

    if (mongoose.connection.readyState === 1 && ChatMessage) {
      replies = await ChatMessage.find({
        clientEmail: req.params.email,
        sender: 'admin',
        status: 'replied'
      }).sort({ createdAt: 1 });
    } else {
      replies = inMemoryMessages.filter(
        (m) => m.clientEmail === req.params.email && m.sender === 'admin'
      );
    }

    return res.json({ success: true, replies });
  } catch (err) {
    console.error('Poll Error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ==========================================================================
// START SERVER & EXPORT FOR VERCEL
// ==========================================================================
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🔒 Secure JAE Global server running at http://localhost:${PORT}`);
    console.log(`💬 Admin Chat Portal available at http://localhost:${PORT}/admin/chat`);
  });
}

module.exports = app;