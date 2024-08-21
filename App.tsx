import MainWorkoutTracker from './src/pages/workoutTracker/main';
import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import 'react-native-url-polyfill/auto';
import {WorkoutTrackerProvider} from './contexts/workoutTracker';
import {fetchUser, setStoreExercise} from './localStorage/insert';
import {fetchActiveWorkout} from './localStorage/fetch';
import Navigation from './src/navigation/navigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Login from './auth/login';

const queryClient = new QueryClient();

const App = () => {
  const [connectionType, setConnectionType] = useState(null);
  const [isConnected, setIsConnected] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setConnectionType(state.type);
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isConnected === true) {
      setStoreExercise();
    }
  }, [isConnected]);

  return (
    <QueryClientProvider client={queryClient}>
      <WorkoutTrackerProvider>
        <GestureHandlerRootView>
          <Navigation />
        </GestureHandlerRootView>
      </WorkoutTrackerProvider>
    </QueryClientProvider>
  );
};

export default App;
