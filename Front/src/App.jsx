import React, { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'



function App() {
  const [users, setUsers] = useState([]);
  const updateUsers = () => {
    axios.get("http://localhost:3001/user/").then((response) => {
      const data = response.data;
      setUsers(data);
    });
  };

  useEffect(() => {
    updateUsers();
  }, [])
  return (
    <>
      {users.map((val, key) => (
        <div key = {key}>
          {val.nome}
        </div>
      ))}
    </>
  )
} 

export default App
