import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const Feed = () => {
  const [sessions, setSessions] = useState([]);
  const getSessions = async () => {
    const res = JSON.parse(await AsyncStorage.getItem('sessions'));
    setSessions(res);
  };

  useEffect(() => {
    getSessions();
  }, []);

  return (
    <View
      style={{
        width: width,
        height: height,
        backgroundColor: '#24262E',
        flexDirection: 'column',
      }}>
      <View style={{height: height * 0.05}} />
      <View
        style={{
          //   alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          paddingTop: 20,
          paddingHorizontal: 20,
        }}>
        <Text
          style={{
            // paddingHorizontal: 20,
            fontSize: 20,
            color: 'white',
            fontFamily: 'SFUIText-Semibold',
            paddingBottom: 10,
          }}>
          Feed
        </Text>
        <View
          style={{
            width: '100%',
            height: 1,
            backgroundColor: '#D9D9D9',
          }}
        />
      </View>
      <ScrollView
        style={{paddingHorizontal: 20, width: '100%', paddingTop: 20}}>
        {sessions.map(s => {
          return (
            <View
              key={s.id}
              style={{
                width: '100%',
                backgroundColor: '#e2e2e2',
                borderRadius: 10,
              }}>
              <Text>user</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Feed;
