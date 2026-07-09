# Starlight Gallery - Product Catalogue

A luxury digital museum React application for Post-Impressionist masterpieces.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode (Required for Images to Load)

**IMPORTANT**: To see images properly, you MUST run the Vite dev server. VSCode's simple preview will not work because this project uses Vite's ES module imports for images.

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:5173
```

3. The application will now load with all images displaying correctly.

### Why VSCode Preview Doesn't Show Images

This project uses Vite's image import system where images are imported as ES modules:
```javascript
import starryNight from "../assets/images/starry-night.jpg";
```

Vite transforms these imports at build time. VSCode's built-in HTML preview cannot handle this transformation, so images won't load. You must use the Vite dev server.

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

- `src/App.jsx` - Main application component
- `src/components/` - React components
- `src/data/mockDb.js` - Mock data for paintings, users, artists
- `src/assets/images/` - Local image assets
- `src/utils/` - Utility functions for storage, validation, etc.

## Features

- Gallery browsing with filters
- Painting details and quick view
- Shopping cart and checkout
- User authentication
- Admin dashboard
- Wishlist and compare functionality
- Reviews and ratings
