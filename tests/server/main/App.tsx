import _ from 'lodash';
import { useState, useEffect } from 'frosty';
import { Text, TextInput, useEnvironment, View, Image } from '../../../src/view';

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
        <Image source="https://upload.wikimedia.org/wikipedia/commons/b/b6/SIPI_Jelly_Beans_4.1.07.tiff" />
        <Image source="https://upload.wikimedia.org/wikipedia/commons/b/b6/SIPI_Jelly_Beans_4.1.07.tiff" />
      </View>
    </View>
  );
};
