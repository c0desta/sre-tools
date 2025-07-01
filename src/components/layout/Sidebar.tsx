import React, { useState, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from '../icons';
import tools from '../../config/tools';

const Sidebar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = useMemo(() => {
    if (!searchTerm) {
      return tools;
    }
    return tools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const groupedTools = useMemo(() => {
    return filteredTools.reduce((acc, tool) => {
      const category = tool.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tool);
      return acc;
    }, {} as Record<string, typeof tools>);
  }, [filteredTools]);

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-700">
        <Link to="/" className="text-2xl font-bold text-white hover:text-gray-200">
          SRE Tools
        </Link>
      </div>
      <div className="p-4">
        <input
          type="text"
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
      <nav className="flex-1 overflow-y-auto">
        {Object.entries(groupedTools).map(([category, toolsInCategory]) => (
          <div key={category} className="py-2">
            <h3 className="px-4 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
              {category}
            </h3>
            <ul>
              {toolsInCategory.map((tool) => (
                <li key={tool.id}>
                  <NavLink
                    to={tool.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 text-sm transition-colors duration-150 ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`
                    }
                  >
                    <span className="mr-3 text-lg">{tool.icon}</span>
                    <span>{tool.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
            <div className="p-4 mt-auto border-t border-gray-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
        >
          {theme === 'light' ? (
            <><FiMoon className="mr-2" /> Switch to Dark Mode</>
          ) : (
            <><FiSun className="mr-2" /> Switch to Light Mode</>
          )}
        </button>
      </div>
      <footer className="p-4 border-t border-gray-700 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} SRE Tools</p>
      </footer>
    </aside>
  );
};

export default Sidebar;
