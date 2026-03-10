# ConflictCheck

A modern, interactive tool for analyzing database transaction serializability using precedence graphs.

[![ConflictCheck](https://img.shields.io/badge/ConflictCheck-Database%20Serializability-blue)]
[![React](https://img.shields.io/badge/React-18.2-blue)]
[![Vite](https://img.shields.io/badge/Vite-5.2-blue)]

**Live Demo**: [https://conflict-check-pearl.vercel.app/](https://conflict-check-pearl.vercel.app/)

## Overview

ConflictCheck is a web-based tool that helps students and developers understand database transaction serializability concepts. It detects conflicts between database operations and visualizes them using an interactive precedence graph to determine if a schedule is conflict-serializable.

## Features

- **Interactive Schedule Builder**: Add and edit database operations (Read/Write) for multiple transactions
- **Automatic Conflict Detection**: Automatically identifies read-write, write-read, and write-write conflicts
- **Precedence Graph Visualization**: Visual representation of transaction dependencies
- **Cycle Detection**: Determines if the schedule is conflict-serializable by detecting cycles
- **Responsive Design**: Works on desktop and mobile devices
- **Modern Dark Theme**: Beautiful glassmorphism UI with dark mode

## How It Works

### Conflict Types

ConflictCheck detects three types of conflicts between operations on the same data item by different transactions:

1. **Read-Write (RW)**: One transaction reads data while another writes
2. **Write-Read (WR)**: One transaction writes data while another reads  
3. **Write-Write (WW)**: Two transactions write to the same data item

### Serializability Check

The tool builds a **precedence graph** where:
- Each transaction is a node
- An edge from T₁ → T₂ exists if T₁ conflicts with T₂ and T₁ executes before T₂

A schedule is **conflict-serializable** if and only if the precedence graph has **no cycles**.

## Usage

### Adding Operations

1. Click **"Add Row"** to add a new operation to the schedule
2. Click the **+** button in a transaction column to assign that operation to that transaction
3. Use the dropdown to select **Read (R)** or **Write (W)** operations
4. Choose the variable (A, B, C, etc.) for the operation

### Configuring Transactions

- Use the **Transactions** input to set the number of transactions (1-10)
- Use the **Variables** input to set the number of variables (1-26)

### Interpreting Results

- **Green Check**: Schedule is conflict-serializable (no cycles in graph)
- **Red X**: Schedule is not conflict-serializable (cycle detected)
- **Conflict tags**: Show which transaction pairs have conflicts

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Clone and Run

```bash
# Clone the repository
git clone https://github.com/nawaf-al-hussain/conflict-check.git
cd conflict-check

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Deployment

### Vercel (Recommended)

1. Go to [Vercel](https://vercel.com/new)
2. Import your GitHub repository
3. Deploy with default settings

### GitHub Pages

1. Build the project: `npm run build`
2. Deploy the `dist` folder to GitHub Pages

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Lucide React** - Icons
- **Canvas Confetti** - Celebration animation
- **Custom CSS** - Styling with design tokens

## Project Structure

```
conflict-check/
├── index.html          # Entry HTML
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies
└── src/
    ├── main.jsx       # React entry point
    ├── App.jsx        # Main application component
    ├── index.css      # Global styles
    └── utils/
        └── logic.js   # Conflict detection algorithms
```

## License

MIT License - feel free to use for educational purposes!

## Acknowledgments

Built to help students understand database serializability concepts in a visual, interactive way.
