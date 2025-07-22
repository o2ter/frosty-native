import _ from 'lodash';
import { useState, useEffect } from 'frosty';
import { Text, TextInput, useEnvironment, View } from '../../../src/view';

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
        backgroundColor: 'red',
      }}>
        <TextInput />
        <TextInput multiline />
      </View>
      <View style={{
        flex: 1,
        backgroundColor: 'blue',
      }}>
        <Text>Hello, <Text>World</Text></Text>
        <Text>Hello, <Text>World</Text></Text>
      </View>
    </View>
  );
};
