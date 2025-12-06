
# 🩺 Swasthi – AI-Driven Public Health Chatbot  

## Overview  
Swasthi is a multilingual AI chatbot designed to support **preventive healthcare awareness** for rural and semi-urban populations. It answers health queries, reminds users about vaccination schedules, 

Built for **SIH problem statement: SIH25049 – AI-Driven Public Health Chatbot for Disease Awareness**.  

---

## Features  
- 🌐 **Multilingual support** (English, Hindi, Bengali + 7 more Indian languages)  
- 🧠 **Personalized memory** (stores user preferences like language & info)  
- 💉 **Vaccination reminders** (auto-calculated from age / child birthdate)  
- 🚨 **Outbreak alerts** (fetches advisories from government health portals)  
- ❓ **FAQs & preventive tips** (validated, evidence-based responses only)  
- 🤖 **AI-assisted chat** powered by Gemini, tuned for concise, safe answers  

---

## Tech stack  


## Project Directory Structure

```
~/
├── src/
│   ├── index.js                # Main entry point for backend logic
│   ├── Events/
│   │   └── textMessage.js      # Telegram bot event handler for text messages
│   └── Utils/
│       ├── eventHandler.js     # Utility functions for event handling
│       └── frontendHandler.js  # Express server for serving frontend files
├── www/
│   ├── index.html              # Main frontend HTML file
│   ├── style.css, card.css     # CSS stylesheets
│   ├── card.js, script.js      # Frontend JavaScript files
│   └── [images, assets]        # Static assets (jpg, png, etc.)
├── package.json                # Node.js dependencies and scripts
└── README.md                   # Project documentation
```
