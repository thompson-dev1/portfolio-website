# Developer Portfolio Plan

## Goal

Build a polished developer portfolio that presents Jahaziel as a capable full-stack/product-minded developer with strong system-building ability, practical problem solving, and enough visual craft to stand out.

The portfolio should not feel like a basic resume site. It should feel like a curated product showcase: clear, confident, visual, and grounded in real projects.

## Core Positioning

**Primary identity:** Full-stack developer with strong web application, database, dashboard, and product workflow experience.

**Supporting identity:** Developer who can also build polished frontend experiences and client-facing portfolio/marketing websites.

**Suggested headline:**

> I build practical, polished web systems that turn messy real-world workflows into simple digital experiences.

**Alternative headline:**

> Full-stack developer crafting useful web platforms, clean interfaces, and product experiences that solve real problems.

## Recommended Site Concept

### Concept Name

**The Build Room**

A portfolio experience that walks visitors through how projects are designed, engineered, polished, and shipped.

### Tone

- Confident but not arrogant
- Technical but understandable
- Visual but performance-conscious
- Professional with a little creative edge

### Visual Direction

- Keep the established graphite, ivory, and crimson palette as the portfolio's signature
- Pair a high-contrast editorial serif for major headlines with a clean sans serif for reading
- Use occasional light surfaces to create clear pauses between dark project sections
- Keep the space and blueprint details subtle so the work stays in focus
- Use a compact graphite navigation panel with ivory links, crimson accents, and contact details
- Make section reveals and menu transitions smooth, short, and restrained; respect reduced-motion preferences

## Site Structure

The primary navigation opens five distinct page views: Home (`/`), Works (`/work`), Playground (`/playground`), About (`/about`), and Contact (`/contact`). Each view keeps the shared header and footer while presenting only its own content.

### 1. Hero

Purpose: Immediately explain who Jahaziel is and what kind of work he does.

Content:

- One bold headline
- Short supporting sentence
- Primary CTA: View Projects
- Secondary CTA: Contact Me
- Small proof row: Flask, PHP, SQLite, Next.js, React, Tailwind, Python

### 2. Featured Projects

Purpose: Show the best 3 projects first, with strong case-study framing.

Recommended order:

1. AADES
2. AGRIC DSS
3. Model Portfolio

### 3. Project Case Studies

Each featured project should have:

- Problem
- Goal
- Role
- Tech stack
- Key features
- Architecture or workflow
- Challenges
- Outcome
- What I learned
- Screenshots or demo video
- Live link or status

### 4. Experiments / Other Work

Purpose: Include smaller hosted Netlify projects without overclaiming them.

Possible labels:

- Live Prototype
- Frontend Experiment
- UI Concept
- In Progress
- Student Project

### 5. Skills

Group skills by value, not just technology names.

Suggested groups:

- Frontend: React, Next.js, Tailwind, responsive UI
- Backend: Flask, PHP, APIs, authentication, sessions
- Databases: SQLite, schema design, CRUD workflows
- Product Systems: dashboards, user roles, notifications, reports
- UX Polish: motion, layout, visual hierarchy, accessibility basics
- Deployment: Netlify, local/XAMPP, future Vercel/Render/Railway

### 6. About

Purpose: Make the developer behind the work feel real.

Angle:

Jahaziel builds systems that solve practical problems, especially around education, agriculture, dashboards, and portfolio/product experiences. He is growing toward full-stack engineering with a strong eye for frontend presentation.

### 7. Contact

Purpose: Make it easy to reach out.

Include:

- Email
- GitHub
- LinkedIn
- Location: Ghana / Accra if desired
- Availability note

## Featured Project 1: AADES

### Working Title

**AADES: Automated Academic Documentation Evaluation System**

### Portfolio Category

Flagship Full-Stack / AI-Assisted Academic Platform

### Why It Should Be Featured

This is the strongest flagship project because it solves a clear institutional problem and demonstrates full-stack thinking: authentication, role-based dashboards, document uploads, evaluation logic, notifications, admin tooling, and database design.

### Short Description

AADES is a Flask-based academic document evaluation platform that helps students and supervisors evaluate academic submissions for structure, grammar, formatting compliance, and similarity before final review.

### Problem

Academic document review is often manual, slow, inconsistent, and difficult to scale. Students may submit work with missing sections, formatting errors, weak citations, or similarity issues without knowing before review.

### Solution

AADES provides a multi-role web platform where students upload PDF/DOCX documents, receive automated evaluation feedback, and submit work to supervisors. Supervisors review submissions, leave comments, manage statuses, and archive completed reviews. Admins manage users, criteria, and system logs.

### Role

Full-stack developer / system designer.

### Stack

- Python
- Flask
- SQLite
- HTML/CSS templates
- PDF/DOCX parsing
- Rule-based document analysis
- TF-IDF similarity checking

### Key Features

- Student, supervisor, and admin roles
- Login/session-based authentication
- PDF and DOCX upload support
- Document structure checks
- Grammar feedback
- Similarity/plagiarism-style scoring
- Configurable evaluation criteria
- Supervisor review dashboard
- Notifications
- Admin user management
- Audit logs
- Document library

### Case Study Angle

This project should be presented as a real workflow automation system for academic review, not just a school project.

### Polish Needed Before Public Portfolio

- Add screenshots of student, supervisor, and admin dashboards
- Clean/separate demo credentials
- Add README with setup instructions
- Add demo data notes
- Consider deployment path: Render/Fly.io/Railway or a recorded demo video
- Confirm no private student data is shown publicly

## Featured Project 2: AGRIC DSS

### Working Title

**AGRIC DSS: Agricultural Marketplace & Decision Support Platform**

### Portfolio Category

Full-Stack Marketplace / Business Workflow System

### Why It Should Be Featured

This project shows breadth: marketplace flows, buyer/farmer/admin roles, product management, orders, cart, subscriptions, loans, chat, reports, and dashboards.

### Short Description

AGRIC DSS is a PHP-based agricultural marketplace and decision support system that connects farmers and buyers through product listings, orders, subscriptions, loan workflows, messaging, and admin controls.

### Problem

Farmers and buyers often lack a centralized digital platform for product discovery, pricing, order management, and communication.

### Solution

The system provides a marketplace where farmers can list products, buyers can browse and purchase, and admins can manage approvals, promotions, pricing, loans, subscriptions, and sales reports.

### Role

Full-stack developer.

### Stack

- PHP
- SQLite
- Bootstrap
- JavaScript
- PHPMailer
- XAMPP/local server

### Key Features

- Buyer, farmer, and admin workflows
- Product listing and management
- Cart and purchase flows
- Order tracking
- Service bookings
- Loan/subscription workflows
- Product promotions
- Chat/messaging
- Notifications
- Sales reports and receipts
- Email verification / OTP-related flows

### Case Study Angle

This project should be framed as a business platform that handles real marketplace operations, not just an ecommerce page.

### Polish Needed Before Public Portfolio

- Add clean screenshots for marketplace, dashboards, cart, reports, and chat
- Document demo accounts
- Hide or sanitize mail config and credentials
- Create a README
- Consider recording a walkthrough instead of deploying immediately
- Later deployment could be moved to a PHP-friendly host or converted to a modern deployable stack

## Featured Project 3: Model Portfolio

### Working Title

**Fashion Model Portfolio Website**

### Portfolio Category

Frontend / Creative Portfolio / Client-Style Website

### Why It Should Be Featured

This project balances the heavier system projects with visual design and frontend polish. It shows the ability to build a client-facing portfolio site with media, animations, and brand presentation.

### Short Description

A modern Next.js portfolio website for a fashion/commercial model, designed to showcase editorial images, campaigns, testimonials, social links, and booking information.

### Problem

Models need a polished digital presence that communicates range, professionalism, and booking readiness without overwhelming visitors.

### Solution

The site presents curated galleries, campaign sections, editorial storytelling, testimonials, and a booking CTA in a responsive, animated interface.

### Role

Frontend developer / website designer.

### Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- GSAP

### Key Features

- Hero section
- Featured portfolio gallery
- About section
- Campaign highlights
- Video/reel section
- Testimonials
- Booking CTA
- Local image-driven content system

### Case Study Angle

This project should be positioned as a client-ready creative portfolio build with emphasis on design, storytelling, responsive layout, and animation.

### Polish Needed Before Public Portfolio

- Confirm image optimization
- Add production metadata and Open Graph image
- Replace placeholder domain if needed
- Confirm contact/social links are intentional before publishing
- Deploy to Vercel or Netlify
- Add screenshots and performance notes

## Hosted Netlify Projects To Review

Known hosted links:

- https://caloriea-i.netlify.app
- https://cerulean-selkie-d4cc49.netlify.app
- https://statuesque-beignet-ce32e2.netlify.app

These should be reviewed visually and technically before deciding whether they become featured projects or supporting experiments.

Possible categories:

- AI/Product prototype
- Frontend UI experiment
- Static/client project
- Utility app

## Project Selection Strategy

### Featured Projects

Use only 3 featured projects on the homepage. This keeps the portfolio premium and focused.

Recommended featured set:

1. AADES
2. AGRIC DSS
3. Model Portfolio

### Supporting Projects

Use hosted Netlify projects as smaller cards under a section called:

- Experiments
- Selected Builds
- More Work
- Prototypes & Interfaces

## Deployment Strategy

### AADES

Best immediate option: case study with screenshots and walkthrough video.

Possible future deployment:

- Render
- Railway
- Fly.io
- PythonAnywhere

Needs cleanup before deployment.

### AGRIC DSS

Best immediate option: case study with screenshots and walkthrough video.

Possible future deployment:

- PHP-friendly shared hosting
- Render with Docker
- Railway with custom setup
- Convert/rebuild later if needed

Needs credential/config cleanup before deployment.

### Model Portfolio

Best immediate option: deploy soon.

Possible deployment:

- Vercel
- Netlify

This is likely the easiest local project to host quickly.

## Portfolio Content Checklist

For each featured project, collect:

- Project name
- One-line summary
- 3 to 5 screenshots
- Tech stack
- Your role
- Problem statement
- Key features
- Biggest challenge
- What you learned
- Live link if available
- GitHub link if public
- Demo video if not deployed

## Build Roadmap

### Phase 1: Content Foundation

- Finalize project names and descriptions
- Choose 3 featured projects
- Write case-study drafts
- Gather screenshots/demo videos

### Phase 2: Portfolio Design

- Create visual direction
- Define typography and colors
- Design homepage structure
- Design project case-study page

### Phase 3: Build

- Set up Next.js or Astro portfolio
- Build homepage
- Build project data system
- Build case-study pages
- Add motion polish

### Phase 4: Proof And Polish

- Test mobile responsiveness
- Improve performance
- Add SEO metadata
- Add accessibility checks
- Clean project links
- Prepare deploy

## Immediate Next Steps

1. Review the three hosted Netlify projects.
2. Capture screenshots from AADES, AGRIC DSS, and Model Portfolio.
3. Write first-pass case studies for the three featured projects.
4. Decide whether the final portfolio should be built with Next.js or Astro.
5. Start building the portfolio homepage.
