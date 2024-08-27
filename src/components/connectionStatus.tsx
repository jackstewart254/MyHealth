import {useState, useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';

const useConnectionStatus = () => {
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

  return {isConnected, connectionType};
};

export default useConnectionStatus;
