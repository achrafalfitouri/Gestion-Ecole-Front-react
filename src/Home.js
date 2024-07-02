import React, { useContext } from 'react';
import { UserContext } from './UserContextData/UserContext';

const Home = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.NomUtilisateur}!</h1>
      {/* Add more UI elements here */}
    </div>
  );
};

export default Home;
