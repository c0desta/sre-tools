import React, { Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import tools from './config/tools';
import './App.css';

// Loading component for Suspense fallback
const Loading = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Loading tool...</p>
  </div>
);

const App: React.FC = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={
              <div className="home-page">
                <h1>Welcome to SRE Tools</h1>
                <p>A collection of useful tools for Site Reliability Engineers and DevOps professionals.</p>
                
                {/* Group tools by category */}
                {Array.from(new Set(tools.map(tool => tool.category))).map(category => (
                  <div key={category} className="tool-category">
                    <h2>{category}</h2>
                    <div className="tools-grid">
                      {tools
                        .filter(tool => tool.category === category)
                        .map(tool => (
                          <div key={tool.id} className="tool-card">
                            <h3>{tool.icon && <span className="tool-icon">{tool.icon}</span>} {tool.title}</h3>
                            <p>{tool.description}</p>
                            <Link to={tool.path} className="tool-link">
                              Use Tool <span className="arrow">→</span>
                            </Link>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            } />
            
            {/* Generate routes for all tools */}
            {tools.map(tool => (
              <Route 
                key={tool.id} 
                path={tool.path} 
                element={<tool.component />} 
              />
            ))}
            
            {/* 404 - Not Found */}
            <Route path="*" element={
              <div className="not-found">
                <h2>404 - Page Not Found</h2>
                <p>The page you're looking for doesn't exist or has been moved.</p>
                <Link to="/" className="home-link">← Back to Home</Link>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} SRE Tools - Open Source</p>
      </footer>
    </div>
  );
};

export default App;
