import React from 'react';
import { APP_NAME } from '../constants';

const Logo: React.FC = () => {
  return (
    <div className="text-2xl font-bold tracking-wider">
      {APP_NAME}
    </div>
  );
};

export default Logo;
