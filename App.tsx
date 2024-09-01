import MainWorkoutTracker from './src/pages/workoutTracker/main';
import React, {useEffect, useState} from 'react';
import {View, Text, Alert, Platform, AppState} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import 'react-native-url-polyfill/auto';
import {WorkoutTrackerProvider} from './contexts/workoutTracker';
import {clearKey, setStoreExercise, storeFCM} from './localStorage/insert';
import {fetchActiveWorkout} from './localStorage/fetch';
import Navigation from './src/navigation/navigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Login from './auth/login';
import {
  checkProfiles,
  fetchSessions,
  getDBSessions,
  handleCheckSession,
} from './hooks/fetch';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {localNotification} from './src/components/localNotification';
import NotificationBanner from './src/components/NotificationBanner';
import {insertActivity, insertWorkout} from './hooks/insert';
const queryClient = new QueryClient();

const App = () => {
  const [connectionType, setConnectionType] = useState(null);
  const [isConnected, setIsConnected] = useState(null);
  const [token, setToken] = useState();
  const [logged, setLogged] = useState(false);

  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const insert = async () => {
      await insertActivity(appState);
    };
    insert();
    const handleAppStateChange = nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      }

      if (nextAppState === 'background') {
        console.log('App has gone to the background!');
      }

      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [appState]);

  useEffect(() => {
    const initializeFCM = async () => {
      const fcm = await AsyncStorage.getItem('fcm');

      if (!fcm) {
        const getFCMToken = async () => {
          try {
            if (Platform.OS === 'ios') {
              await messaging().registerDeviceForRemoteMessages();
              const apnsToken = await messaging().getAPNSToken();
              if (apnsToken) {
                const fcmToken = await messaging().getToken();
                if (fcmToken) {
                  storeFCM(fcmToken); // Store the token in AsyncStorage
                  return true;
                } else {
                  return false;
                }
              }
            }
          } catch (error) {
            return false;
          }
        };

        const requestUserPermission = async () => {
          const authStatus = await messaging().requestPermission();
          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

          if (enabled) {
            return true;
          } else {
            return false;
          }
        };
        const intervalId = setInterval(async () => {
          const permissionGranted = await requestUserPermission();
          if (permissionGranted) {
            const tokenObtained = await getFCMToken();
            if (tokenObtained) {
              clearInterval(intervalId); // Clear the interval once the token is obtained
            }
          }
        }, 5000); // Adjust the interval duration as needed

        return () => {
          clearInterval(intervalId); // Clear the interval if the component unmounts
        };
      } else {
      }
    };

    const unsubscribe = messaging().onTokenRefresh(token => {
      storeFCM(token); // Update the stored token in AsyncStorage
    });

    initializeFCM();

    return () => {
      unsubscribe(); // Cleanup the token refresh listener
    };
  }, [isConnected]);

  useEffect(() => {}, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = JSON.parse(await AsyncStorage.getItem('auth'));
      setLogged(res === null ? false : res);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    // clearKey('exercise');
    const uploadSessions = async () => {
      const res = JSON.parse(await AsyncStorage.getItem('sessions'));
      const id = await getDBSessions(logged.user.id);
      let notIn = [];
      for (let x = 0; x < res.length; x++) {
        const present = id.find(i => i === res[x].id);
        if (present === null) {
          notIn.push(res[x]);
        }
      }
      if (notIn.length > 0) {
        for (let i = 0; i < notIn.length; i++) {
          await insertWorkout(notIn[i]);
        }
      }
    };

    const check = async () => {
      await checkProfiles();
    };

    const store = async () => {
      await setStoreExercise();
    };

    if (logged !== false) {
      store();
      uploadSessions();
      check();
    }
  }, [logged]);

  return (
    <QueryClientProvider client={queryClient}>
      <WorkoutTrackerProvider>
        <GestureHandlerRootView>
          <NotificationBanner />
          <Navigation />
        </GestureHandlerRootView>
      </WorkoutTrackerProvider>
    </QueryClientProvider>
  );
};

export default App;
