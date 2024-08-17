import React, {useEffect} from 'react';
import {Dimensions, View} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import MainWorkoutTracker from '../pages/workoutTracker/main';
import MainHome from '../pages/home/main';
import {useWorkoutTracker} from '../../contexts/workoutTracker';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const Navigation = () => {
  const translateX = useSharedValue(0);
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();

  const animatedSlide = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  });

  useEffect(() => {
    if (workoutTracker.view === 'workout') {
      translateX.value = withTiming(-width, {duration: 200});
    }
    if (workoutTracker.close === true) {
      translateX.value = withTiming(0, {duration: 200});
      const timer = setTimeout(() => {
        setWorkoutTracker({...workoutTracker, view: 'home', close: false});
      }, 200);
    }
  }, [workoutTracker.view, workoutTracker.close]);

  return (
    <Animated.View
      style={[
        {width: width * 2, height: height, flexDirection: 'row'},
        animatedSlide,
      ]}>
      <MainHome />
      {workoutTracker.view === 'workout' && <MainWorkoutTracker />}
    </Animated.View>
  );
};

export default Navigation;
