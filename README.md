# Floxtime

A Nuxt 3 application for managing people and their date ranges with a calendar interface.

## Features

- 📅 Interactive calendar for selecting multiple date ranges
- 👥 Add and manage people with their associated date ranges
- 💾 MongoDB Atlas integration for data persistence
- 🚀 Deployed on Vercel

## Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up MongoDB Atlas:**
   - Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
   - Create a new cluster
   - Get your connection string
   - Create a `.env` file in the root directory:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
     ```

3. **Run development server:**
   ```bash
   bun run dev
   ```

4. **Build for production:**
   ```bash
   bun run build
   ```

## Deployment to Vercel

1. **Push your code to GitHub**

2. **Import your project to Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Nuxt.js

3. **Add Environment Variable:**
   - In Vercel project settings, go to "Environment Variables"
   - Add `MONGODB_URI` with your MongoDB Atlas connection string
   - Make sure to select all environments (Production, Preview, Development)

4. **Deploy:**
   - Vercel will automatically deploy on every push to your main branch

## Usage

1. Enter a person's name in the form
2. Click on dates in the calendar to select date ranges (click start date, then end date)
3. You can select multiple date ranges for each person
4. Click "Add Person" to save
5. View all saved people and their date ranges in the list
6. Delete people using the delete button

## Tech Stack

- **Nuxt 3** - Vue.js framework
- **Bun** - JavaScript runtime and package manager
- **MongoDB** - Database
- **Vercel** - Hosting platform
- **TypeScript** - Type safety