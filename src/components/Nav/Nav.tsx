import './Nav.scss';

import React from 'react';
import { Link } from 'react-router-dom';

function Nav() {
  return (
    <nav className="nav-root">
      <h4 className='nav-title'>Joey Murphy</h4>
      <div className='nav-spacer'></div>
      <ul className="nav-list">
        <li className="nav-list-item">
          <Link to="/">Home</Link>
        </li>
        <li className="nav-list-item">
          <Link to="/experience">Experience</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Nav
