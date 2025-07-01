import _ from 'lodash';
import { useState, useEffect } from 'frosty';
import { useEnvironment } from '~/view';

export const App = () => {
  const env = useEnvironment();
  console.log(env);
  return (
    <div>
    </div>
  );
};
