# JAE Global Solutions — Web Application & Codebase Documentation

A high-performance, serverless Node.js/Express corporate web application built for **JAE Global Solutions**. This project uses an EJS templating engine for fast server-side rendering, equipped with security controls, automated lead processing, and seamless Vercel deployment.

---

## 🛠️ Tech Stack & Integrations

* **Runtime & Framework:** Node.js, Express.js
* **Templating Engine:** EJS (Embedded JavaScript)
* **Styling & UI:** Vanilla CSS3 (Custom Responsive Grid, Flexbox, Glassmorphism, Accordions)
* **Email & Communications:** Nodemailer (SMTP dual-email dispatch and client auto-responder)
* **Security & Anti-Spam:** Cloudflare Turnstile CAPTCHA, Express Rate-Limiting, Honeypot fields
* **Hosting & CI/CD:** Vercel (Serverless Functions) connected via GitHub CI/CD pipeline
* **Domain & DNS:** Custom domain (`jaeglobalsolutions.com`) configured via Cloudflare & Squarespace

---

## 📁 Repository Directory Structure

```text
.
├── public/
│   ├── css/
│   │   └── style.css            # Global stylesheet, UI components, & mobile breakpoints
│   └── images/                  # Static assets, branding logos, and icons
├── views/
│   ├── partials/
│   │   ├── header.ejs           # OpenGraph, Meta SEO tags, & dynamic head links
│   │   ├── nav.ejs              # Responsive header navigation & drawer menu
│   │   └── footer.ejs           # Global footer component
│   ├── 404.ejs                  # Custom error page
│   ├── about.ejs                # About Us page
│   ├── careers.ejs              # Careers & hiring page
│   ├── contact.ejs              # Contact & Lead form view
│   ├── culture.ejs              # Company Culture page
│   ├── how-it-works.ejs         # Process & Methodology page
│   ├── index.ejs                # Main Homepage view
│   ├── reviews.ejs              # Client Testimonials & Reviews page
│   └── services.ejs             # Services breakdown & accordions
├── .env                         # Local environment variables (git-ignored)
├── vercel.json                  # Serverless route mapping for Vercel
├── server.js                    # Core Express server, routes, & controller logic
└── package.json                 # Node dependencies and project scripts


🚀 Key Application Features
1. Multi-Page Architecture (10 Views)
Server-side rendered pages using modular EJS templates (header, nav, footer).

Responsive layouts optimized for desktop, tablet, and mobile displays with overflow protection.

2. Contact Form & Lead Processing System
Client-Side & Server-Side Validation: Ensures all fields are formatted properly before processing.

Dual-Email Dispatch Logic:

Instantly notifies admin@jaeglobalsolutions.com with complete lead submission details.

Sends an automated, styled confirmation email back to the visitor.

Database & Webhook Ready: Extensible backend handler structured for DB storage or webhook integrations.

3. Security & Bot Mitigation
Cloudflare Turnstile: Server-validated CAPTCHA to prevent automated bot entries.

Honeypot Trap: Hidden form field to silently reject spam scripts.

Rate Limiting: Protects backend endpoints against brute-force spam attacks.

4. Technical SEO Optimization
Dynamic Sitemap (/sitemap.xml): Generates compliant XML sitemap output.

Robots Configuration (/robots.txt): Directs web crawlers to the dynamic sitemap.

