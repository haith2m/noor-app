# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Noor is an Islamic desktop application built with Electron and React that provides prayer times, Azkar (remembrances), Quran audio playback, and Hijri calendar functionality. The app supports Arabic (primary) and English languages.

## Tech Stack

- **Frontend**: React 17 with React Router v6
- **Desktop Framework**: Electron 31
- **Styling**: TailwindCSS 3.4
- **State Management**: React Context API (PageContext)
- **Data Storage**: electron-store for persistent settings
- **Internationalization**: i18next with React bindings
- **Prayer Calculations**: adhan library
- **Build Tools**: react-scripts (Create React App), electron-builder

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (React + Electron)
npm start

# Build for production
npm run build

# Build for specific platforms
npm run build:linux

# Create release builds for all platforms
npm run release

# Run tests
npm run react-test
```

## Architecture

### Main Process (Electron)
- **public/electron.js**: Main Electron process handling window creation, IPC communication, prayer notifications, system tray, and auto-updater
- **public/preload.js**: Preload script for secure context bridging between renderer and main process

### Renderer Process (React)
- **src/App.js**: Main application component managing prayer times calculation and page routing
- **src/PageContext.js**: Global context provider for settings and page navigation state
- **src/i18n.js**: Internationalization configuration

### Core Components Structure
- **components/Home/**: Prayer times display and main dashboard
- **components/Azkar/**: Islamic remembrances functionality
- **components/AudioQuran/**: Quran audio player
- **components/Quran/**: Quran text display
- **components/Calendar/**: Hijri/Gregorian calendar
- **components/Settings.js**: Application settings management
- **components/Sidebar.js**: Navigation sidebar
- **components/TitleBar.js**: Custom window title bar (frameless window)

### Data Files
- **public/azkar.json**: Islamic remembrances data
- **public/reciters*.json**: Quran reciters information
- **public/suwar-*.json**: Quran chapters metadata
- **public/ar.json, en.json**: Translation files

## Key Implementation Notes

### Prayer Times System
- Uses the `adhan` library for accurate prayer time calculations
- Supports multiple calculation methods (UmmAlQura default)
- Implements a cron job (node-cron) that checks every minute for prayer notifications
- Stores user location and sends desktop notifications with optional Adhan sound

### Electron-React Communication
- IPC channels for window controls (minimize, maximize, close)
- Resource path handling for both development and production
- Auto-updater integration with GitHub releases

### Styling Approach
- TailwindCSS with custom CSS variables for theming
- Dynamic color system using CSS variables (--primary-*, --bg-color-*, --text-*)
- Safelist patterns in tailwind.config.js for dynamic color classes

### Build Configuration
- Multi-platform support (Windows NSIS, Linux AppImage/deb/rpm/snap)
- GitHub auto-updater configuration
- Homepage set to "./" for file:// protocol compatibility

## Testing Approach

The project uses Jest with react-scripts for testing React components. Run tests with `npm run react-test`.

## Important Considerations

- The app runs in a frameless window mode with custom title bar implementation
- System tray integration with minimize-to-tray option
- Persistent settings storage using electron-store
- Audio playback for Adhan notifications and Quran recitation
- Moment.js and moment-hijri for date calculations