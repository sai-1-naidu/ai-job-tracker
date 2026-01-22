# AI-Powered Job Tracker with Smart Matching

## 🔗 Live Demo
Frontend: https://YOUR_FRONTEND_URL  
Backend: https://YOUR_BACKEND_URL

---

## 🧠 Overview
AI-Powered Job Tracker is a smart job discovery and application tracking system.
It matches job listings against a user’s resume, calculates a match score, and
helps users track applications using an intelligent confirmation flow.

The project focuses on **product thinking**, **explainable AI**, and **clean UX**.

---

## 🏗 Architecture Diagram
┌──────────────────────────┐
│        Frontend          │
│     React (Vite) UI      │
│                          │
│ • Job Feed               │
│ • Resume Upload          │
│ • Match Score UI         │
│ • Apply Popup            │
│ • AI Assistant           │
└─────────────▲────────────┘
              │ HTTP (REST)
              │
┌─────────────┴────────────┐
│        Backend            │
│     Node.js + Fastify     │
│                          │
│ • /jobs (GET)             │
│ • /resume/upload (POST)   │
│ • Matching Engine         │
│ • Apply Tracking Logic    │
└─────────────▲────────────┘
              │
              │
┌─────────────┴────────────┐
│   Resume Processing       │
│                          │
│ • PDF/TXT Parsing         │
│ • Text Normalization      │
│ • Tokenization            │
└─────────────▲────────────┘
              │
              │
┌─────────────┴────────────┐
│   In-Memory Storage       │
│                          │
│ • Resume Text             │
│ • Job Data (Mock/API)     │
│ • Application Status      │
└──────────────────────────┘
