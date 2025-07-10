import _ from 'lodash';
import { useState, useEffect } from 'frosty';
import { useEnvironment, View } from '~/view';

export const App = () => {
  const env = useEnvironment();
  console.log(env);
  return (
    <View style={{
      width: '100%',
      height: '100%',
      flexDirection: 'row',
    }}>
      <View style={{
        flex: 1,
        height: '100%',
        backgroundColor: 'red',
      }}>
      </View>
      <View style={{
        flex: 1,
        height: '100%',
        backgroundColor: 'blue',
      }}>
      </View>
    </View>
  );
};
