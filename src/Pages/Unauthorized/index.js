import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const Unauthorized= () => {
  return (
    <Result
      status="403"
      title="403 - L'accès non autorisé"
      subTitle="Désolé, vous n'êtes pas autorisé à accéder à ce contenu."
      extra={
        <Button >
          <Link to="/">Retour</Link>
        </Button>
      }
    />
  );
};

export default Unauthorized
;