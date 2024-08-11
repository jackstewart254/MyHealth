import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  SafeAreaView,
  Text,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import {Cross, Tick} from '../../../assets/svgs/workoutTrackerSvgs';
const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;
import {useQuery} from '@tanstack/react-query';
import {fetchExercises} from '../../../hooks/fetch';
import {useWorkoutTracker} from '../../../contexts/workoutTracker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {format} from 'date-fns/format';
import {getExercise} from '../../../localStorage/fetch';
import CreateWorkout from './workoutTemplate';

const EditWorkout = () => {};

const ActiveWorkout = () => {};

const CreateWorkoutTemplate = () => {
  const translateY = useSharedValue(height * 0.89); // Shared value to control translation
  // const translateY = useSharedValue(0); // Shared value to control translation
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();
  const [close, setClose] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  useEffect(() => {
    const slide = workoutTracker.animateSlide;
    const closeSlide = workoutTracker.closeSlide;
    if (slide === true) {
      translateY.value = withTiming(0, {duration: 300});
    }
    if (closeSlide === true) {
      translateY.value = withTiming(height, {duration: 300});
    }
  }, [workoutTracker.animateSlide, workoutTracker.closeSlide]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          zIndex: 2,
          width: width,
          height: height * 0.89,
          backgroundColor: '#24262E',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        },
        animatedStyle,
      ]}>
      <CreateWorkout />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  semiboldSF: {
    fontFamily: 'SFUIText-Semibold',
    color: 'white',
  },
  blueSemiboldSF: {
    fontFamily: 'SFUIText-Semibold',
    color: '#00B0FF',
    fontSize: 16,
  },
  medSF: {
    fontFamily: 'SFUIText-Medium',
    color: 'white',
  },
  regSF: {
    fontFamily: 'SFUIText-Regular',
    color: 'white',
  },
  blueSFMed: {
    fontFamily: 'SFUIText-Medium',
    color: '#00B0FF',
  },
});

export default CreateWorkoutTemplate;
