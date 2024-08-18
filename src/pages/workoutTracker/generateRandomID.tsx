import React from 'react';

const GenerateRandomID = () => {
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += Math.floor(Math.random() * 10); // Generates a random number between 0 and 9
  }
  return parseInt(id, 10);
};

export default GenerateRandomID;
