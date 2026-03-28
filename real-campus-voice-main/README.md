# CampusPulse

A modern campus feedback and issue management platform designed for transparency and student engagement.

## 🚀 Features

- **Anonymous & Verified Posting**: Students can share concerns using aliases or unique User IDs.
- **Upvoting System**: The community can prioritize the most important issues.
- **Smart Admin Dashboard**:
  - **Sentiment Analysis**: Automatically identifies negative feedback for urgent attention.
  - **Status Tracking**: Issues move from "Open" to "In Progress" and finally "Resolved".
  - **Official Responses**: Admins can provide verified feedback directly on posts.
- **Advanced Moderation**: Integrated reporting system and user banning capabilities.
- **Dark Mode Optimized**: Beautiful, high-contrast UI for all conditions.
- **Mobile Responsive**: Full functionality on any device.

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🚦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/CampusPulse.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 📜 Database Setup

Run the provided [schema.sql](schema.sql) in your Supabase SQL Editor to set up the necessary tables and triggers.
