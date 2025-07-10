# SRE Tools

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A collection of useful tools for Site Reliability Engineers and DevOps professionals. This is a static website built with React that can be easily deployed to GitHub Pages.

## Features

- **AWS IP Lookup**: Check if an IP address belongs to AWS and find its region and service.
- **Easy to Extend**: Add new tools with minimal configuration.
- **Responsive Design**: Works on desktop and mobile devices.
- **Fast and Lightweight**: Built with performance in mind.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later) or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sre-tools.git
   cd sre-tools
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

### Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
- `npm test` - Launches the test runner in interactive watch mode.
- `npm run build` - Builds the app for production to the `build` folder.
- `npm run deploy` - Builds and deploys the app to GitHub Pages.

## 🛠 Adding a New Tool

1. Create a new component in `src/components/tools/` (e.g., `MyNewTool.tsx`)
2. Add your tool to the `src/config/tools.ts` file:
   ```typescript
   const MyNewTool = lazy(() => import('../components/tools/MyNewTool'));
   
   const tools: Tool[] = [
     // ... existing tools
     {
       id: 'my-new-tool',
       title: 'My New Tool',
       description: 'A brief description of what the tool does.',
       path: '/my-new-tool',
       component: MyNewTool,
       category: 'Category Name',
       icon: '🔧',
     },
   ];
   ```

3. That's it! The tool will automatically appear in the navigation and home page.

## 🚀 Deployment

### GitHub Pages

1. Update the `homepage` field in `package.json` with your GitHub Pages URL:
   ```json
   "homepage": "https://your-username.github.io/sre-tools",
   ```

2. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

3. Enable GitHub Pages in your repository settings (GitHub Settings > Pages) to use the `gh-pages` branch.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
