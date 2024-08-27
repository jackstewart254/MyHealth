import React, {useEffect, useState} from 'react';
import {Dimensions, Text, TouchableOpacity, View} from 'react-native';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Profile from '../pages/profile/main';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const Navigation = () => {
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();
  const [userValid, setUserValid] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [view, setView] = useState(0);
  const translateX = useSharedValue(0);

  const animatedSlide = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  });

  useEffect(() => {
    if (workoutTracker.hideLogin === true) {
      setShowLogin(true);
    }
    if (workoutTracker.logOut === true) {
      setShowLogin(false);
    }
  }, [workoutTracker.hideLogin, workoutTracker.logOut]);

  useEffect(() => {
    const lunc = async () => {
      const res = JSON.parse(await AsyncStorage.getItem('auth'));
      setShowLogin(res !== null ? true : false);
    };

    lunc();
  }, [workoutTracker.logOut]);

  useEffect(() => {
    if (view === 0) {
      translateX.value = withTiming(0, {duration: 200});
    }
    if (view === 1) {
      translateX.value = withTiming(-width, {duration: 200});
    }
  }, [view]);

  const tabNavigator = () => {
    return (
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          width: width,
          alignItems: 'center',
          zIndex: 0,
          opacity: 1,
        }}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#E2E2E2',
            overflow: 'hidden',
            borderRadius: 10,
          }}>
          <TouchableOpacity
            onPress={() => {
              setView(0);
            }}
            style={{
              width: 80,
              height: 60,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily:
                  view === 0 ? 'SFUIText-Semibold' : 'SFUIText-Medium',
                color: '#24262E',
                fontSize: view === 0 ? 18 : 16,
              }}>
              Track
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setView(1);
            }}
            style={{
              width: 80,
              height: 60,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily:
                  view === 1 ? 'SFUIText-Semibold' : 'SFUIText-Medium',
                color: '#24262E',
                fontSize: view === 1 ? 18 : 16,
              }}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const altTabNavigator = () => {
    return (
      <View
        style={{
          position: 'absolute',
          bottom: 30,
          width: width,
          alignItems: 'center',
          zIndex: 0,
          opacity: 0.5,
        }}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#E2E2E2',
            overflow: 'hidden',
            borderRadius: 10,
          }}>
          <View
            style={{
              width: 80,
              height: 60,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily:
                  view === 0 ? 'SFUIText-Semibold' : 'SFUIText-Medium',
                color: '#24262E',
                fontSize: view === 0 ? 18 : 16,
              }}>
              Track
            </Text>
          </View>
          <View
            style={{
              width: 80,
              height: 60,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily:
                  view === 1 ? 'SFUIText-Semibold' : 'SFUIText-Medium',
                color: '#24262E',
                fontSize: view === 1 ? 18 : 16,
              }}>
              Profile
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{width: width, height: height, position: 'relative'}}>
      {showLogin === false && <Login />}
      {showLogin === true && (
        <Animated.View
          style={[
            {
              width: width * 2,
              height: height,
              flexDirection: 'row',
            },
            animatedSlide,
          ]}>
          <MainWorkoutTracker />
          <Profile />
        </Animated.View>
      )}
      {showLogin === true && workoutTracker.animateSlide === true
        ? null
        : workoutTracker.showWorkoutComplete === false &&
          workoutTracker.showSession === false &&
          workoutTracker.workoutModal === false
        ? tabNavigator()
        : altTabNavigator()}
    </View>
  );
};

export default Navigation;
