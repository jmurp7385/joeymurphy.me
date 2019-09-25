import './App.scss';

import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Nav from './components/Nav/Nav';
import Experience from './scenes/Experience/Experience';
import Home from './scenes/Home/Home';

function App() {
  return (
    <div className="App">
      <Router>
        <Nav />
        <section className='app-container'>
          <Route path='/' exact component={Home}></Route>
          <Route path='/experience/' component={Experience}></Route>
        </section>
      </Router>

    </div>
  );
}

export default App;
