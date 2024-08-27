import MainWorkoutTracker from './src/pages/workoutTracker/main';
import React, {useEffect, useState} from 'react';
import {View, Text, Alert, Platform} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import 'react-native-url-polyfill/auto';
import {WorkoutTrackerProvider} from './contexts/workoutTracker';
import {clearKey, setStoreExercise, storeFCM} from './localStorage/insert';
import {fetchActiveWorkout} from './localStorage/fetch';
import Navigation from './src/navigation/navigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Login from './auth/login';
import {checkProfiles, fetchSessions, handleCheckSession} from './hooks/fetch';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {localNotification} from './src/components/localNotification';
import NotificationBanner from './src/components/NotificationBanner';
import {insertWorkout} from './hooks/insert';
const queryClient = new QueryClient();

const App = () => {
  const [connectionType, setConnectionType] = useState(null);
  const [isConnected, setIsConnected] = useState(null);
  const [token, setToken] = useState();

  // useEffect(() => {
  //   // Handle messages received while the app is in the foreground
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {

  //     // Display a local notification
  //     PushNotification.localNotification({
  //       channelId: 'default-channel-id', // Make sure this matches the channel ID set in createChannel (Android)
  //       title: remoteMessage.notification?.title || 'New Notification',
  //       message:
  //         remoteMessage.notification?.body ||
  //         'You have received a new message.',
  //       data: remoteMessage.data, // Pass along any data if needed
  //     });

  //     // Optionally, display an alert for debugging or foreground notification
  //     Alert.alert(
  //       remoteMessage.notification?.title || 'New Notification',
  //       remoteMessage.notification?.body || 'You have received a new message.',
  //     );
  //   });

  //   return unsubscribe;
  // }, []);

  // async function requestUserPermission() {
  //   const authStatus = await messaging().requestPermission();
  //   const enabled =
  //     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  //   if (enabled) {
  //   }
  // }

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

  // const getFCMToken = async () => {
  //   if (Platform.OS === 'ios') {
  //     await messaging().registerDeviceForRemoteMessages();
  //     const apnsToken = await messaging().getAPNSToken();
  //     if (apnsToken) {
  //       const fcm = await AsyncStorage.getItem('fcm');
  //       // if (fcm === null) {
  //       const fcmToken = await messaging().getToken();
  //       if (fcmToken) {
  //         storeFCM(fcmToken);
  //         console.log(fcmToken);
  //       } else {
  //         console.log('Failed to get FCM token');
  //       }
  //       // }
  //     }
  //   }
  // };

  useEffect(() => {}, [token]);

  useEffect(() => {
    const uploadSessions = async () => {
      const res = JSON.parse(await AsyncStorage.getItem('sessions'));
      for (let i = 0; i < res?.length; i++) {
        await insertWorkout(res[i]);
      }
    };

    const check = async () => {
      await checkProfiles();
    };

    uploadSessions();
    check();
  }, []);

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
