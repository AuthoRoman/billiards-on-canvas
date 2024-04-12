import React from 'react';
 
import './App.css';
import BoardComponent from './components/BoardComponent';

function App() {
  return (
    <div className="App">
      //! ADD scoreGoals
        <BoardComponent height={600} width={400}/>
       
    </div>
  );
}

export default App;
