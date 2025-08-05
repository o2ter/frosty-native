import _ from 'lodash';
import { useState, useEffect } from 'frosty';
import { Text, TextInput, useEnvironment, View, Image, Pressable } from '../../../src/view';

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
      <View
        onLayout={function (e) { console.log('onLayout', this, e) }}
        style={{
          flex: 1,
          backgroundColor: 'blue',
        }}>
        <Pressable
          onHoverIn={function (e) { console.log('onHoverIn', this, e) }}
          onHoverOut={function (e) { console.log('onHoverOut', this, e) }}
          onPressIn={function (e) { console.log('onPressIn', this, e) }}
          onPressOut={function (e) { console.log('onPressOut', this, e) }}
          onPress={function (e) { console.log('onPress', this, e) }}
        >
          <Text>Hello, <Text>World</Text></Text>
        </Pressable>
        <Text>Hello, <Text>World</Text></Text>
        <Image source="https://upload.wikimedia.org/wikipedia/commons/b/b6/SIPI_Jelly_Beans_4.1.07.tiff" />
        <Image source="https://upload.wikimedia.org/wikipedia/commons/b/b6/SIPI_Jelly_Beans_4.1.07.tiff" />
      </View>
    </View>
  );
};
