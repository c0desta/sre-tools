import React from 'react';
import { Link } from 'react-router-dom';
import tools from '../../config/tools';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">SRE Tools</Link>
      </div>
      <div className="navbar-menu">
        {tools.map((tool) => (
          <Link 
            key={tool.id} 
            to={tool.path} 
            className="navbar-item"
          >
            {tool.icon && <span className="navbar-icon">{tool.icon}</span>}
            {tool.title}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
