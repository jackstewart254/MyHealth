import {Dimensions, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {useWorkoutTracker} from '../../../contexts/workoutTracker';
import LinearGradient from 'react-native-linear-gradient';
import LineChartExample from '../../components/graphs/lineGraph';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const MainHome = () => {
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();
  return (
    <View
      style={{
        width: width,
        height: height,
        backgroundColor: '#24262E',
        // justifyContent: 'center',
      }}>
      {/* <LinearGradient
        colors={['#747A94', '#24262E']}
        style={{width: '100%', height: '40%', position: 'absolute', zIndex: -1}}
      /> */}
      <View
        style={{
          width: width,
          height: height,
          padding: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <LineChartExample />
        <TouchableOpacity
          onPress={() => {
            setWorkoutTracker({...workoutTracker, view: 'workout'});
          }}
          style={{
            width: '100%',
            height: 40,
            backgroundColor: '#00B0FF',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
          }}>
          <Text
            style={{
              fontFamily: 'SFUIText-Medium',
              fontSize: 14,
              color: 'white',
            }}>
            Workout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MainHome;
