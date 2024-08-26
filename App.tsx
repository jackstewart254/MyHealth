import MainWorkoutTracker from './src/pages/workoutTracker/main';
import React, {useEffect, useState} from 'react';
import {View, Text, Alert} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import 'react-native-url-polyfill/auto';
import {WorkoutTrackerProvider} from './contexts/workoutTracker';
import {clearKey, setStoreExercise, storeFCM} from './localStorage/insert';
import {fetchActiveWorkout} from './localStorage/fetch';
import Navigation from './src/navigation/navigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Login from './auth/login';
import {fetchSessions, handleCheckSession} from './hooks/fetch';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {localNotification} from './assets/localNotification';
const queryClient = new QueryClient();

const App = () => {
  const [connectionType, setConnectionType] = useState(null);
  const [isConnected, setIsConnected] = useState(null);
  const [token, setToken] = useState();

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      Alert.alert(
        'A new FCM message arrived!',
        remoteMessage.notification.body,
      );
    });

    return unsubscribe;
  }, []);

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
    }
  }

  useEffect(() => {
    setStoreExercise();
    requestUserPermission().then(getFCMToken);

    const unsubscribe = messaging().onTokenRefresh(token => {});

    return () => {
      unsubscribe();
    };
  }, [isConnected]);

  const getFCMToken = async () => {
    const fcm = await AsyncStorage.getItem('fcm');
    if (fcm === null) {
      const fcmToken = await messaging().getToken();
      setToken(fcmToken);
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        storeFCM(fcmToken);
      } else {
        console.log('Failed to get FCM token');
      }
    } else {
      setToken(fcm);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WorkoutTrackerProvider>
        <GestureHandlerRootView>
          <Text style={{height: 140, paddingTop: 60}}>{token}</Text>
          <Navigation />
        </GestureHandlerRootView>
      </WorkoutTrackerProvider>
    </QueryClientProvider>
  );
};

export default App;
