import React, { Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import tools from './config/tools';
import Sidebar from './components/layout/Sidebar';
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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={
                <div className="p-8">
                  <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Welcome to SRE Tools</h1>
                  <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Select a tool from the sidebar to get started.</p>
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
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">404 - Page Not Found</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">The page you're looking for doesn't exist or has been moved.</p>
                  <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:underline mt-4 inline-block">← Back to Home</Link>
                </div>
              } />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default App;
