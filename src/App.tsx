import React, { Suspense, useState } from 'react';
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
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
          <Link to="/" className="text-xl font-bold">SRE Tools</Link>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} aria-label="Toggle sidebar">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </header>
        <main className="flex-1 relative overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800">
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            ></div>
          )}
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
        </main>
      </div>
    </div>
  );
};

export default App;
