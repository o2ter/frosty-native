import _ from 'lodash';
import { useState, useEffect } from 'frosty';
import { useEnvironment, View } from '~/view';

export const App = () => {
  const env = useEnvironment();
  console.log(env);
  return (
    <View style={{
      minWidth: '100%',
      minHeight: '100%',
      flexDirection: 'row',
    }}>
      <View style={{
        flex: 1,
        backgroundColor: 'red',
      }}>
      </View>
      <View style={{
        flex: 1,
        backgroundColor: 'blue',
      }}>
      </View>
    </View>
  );
};
