import React, {useState, useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {View, Text} from 'react-native';

const ConnectionStatus = () => {
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

  return isConnected;
};

export default ConnectionStatus;
