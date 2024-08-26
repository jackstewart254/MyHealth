import React, {useEffect, useState} from 'react';
import {Dimensions, Text, View} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import MainWorkoutTracker from '../pages/workoutTracker/main';
import MainHome from '../pages/home/main';
import {useWorkoutTracker} from '../../contexts/workoutTracker';
import {clearKey, fetchUser} from '../../localStorage/insert';
import Login from '../../auth/login';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const Navigation = () => {
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();
  const [userValid, setUserValid] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (workoutTracker.hideLogin === true) {
      setShowLogin(true);
    }
  }, [workoutTracker.hideLogin]);

  useEffect(() => {
    const lunc = async () => {
      const res = JSON.parse(await fetchUser());
      setShowLogin(res !== null && true);
    };

    lunc();
  }, []);

  return (
    <View style={{width: width, height: height}}>
      {showLogin === false && <Login />}
      {showLogin === true && <MainWorkoutTracker />}
    </View>
  );
};

export default Navigation;
