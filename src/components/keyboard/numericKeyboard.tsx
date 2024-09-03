import {Text, View, Dimensions} from 'react-native';
import React from 'react';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const NumKeyboard = () => {
  const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0];
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        width: width,
        height: height * 0.33,
        backgroundColor: 'white',
        zIndex: 2,
        flexDirection: 'row',
      }}>
      <View style={{width: '80%', height: '100%'}}>
        {buttons.map((button, index) => {
          return (
            <View key={index}>
              <Text>{button}</Text>
            </View>
          );
        })}
      </View>
      <View style={{width: '20%', height: '100%'}}></View>
    </View>
  );
};

export default NumKeyboard;
