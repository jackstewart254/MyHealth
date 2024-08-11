import MainWorkoutTracker from './src/pages/workoutTracker/main';
import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import 'react-native-url-polyfill/auto';
import {WorkoutTrackerProvider} from './contexts/workoutTracker';
import {setStoreExercise} from './localStorage/insert';

const queryClient = new QueryClient();

const App = () => {
  const [connectionType, setConnectionType] = useState(null);
  const [isConnected, setIsConnected] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setConnectionType(state.type);
      setIsConnected(state.isConnected);
      if (state.isConnected === true) {
        setStoreExercise();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {}, [connectionType, isConnected]);

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{flex: 1}}>
        <WorkoutTrackerProvider>
          <MainWorkoutTracker />
        </WorkoutTrackerProvider>
      </View>
    </QueryClientProvider>
  );
};

export default App;
