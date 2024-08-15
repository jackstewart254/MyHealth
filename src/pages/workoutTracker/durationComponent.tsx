/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Pressable,
} from 'react-native';
import {
  addSeconds,
  format,
  differenceInMinutes,
  differenceInSeconds,
} from 'date-fns';

const Duration = ({startTime, color}: {startTime: string; color: string}) => {
  const [timeDifference, setTimeDifference] = useState({
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateDifference = () => {
      const now = new Date();
      const minutes = differenceInMinutes(now, startTime);
      const totalSeconds = differenceInSeconds(now, startTime);
      const seconds = totalSeconds % 60;
      setTimeDifference({minutes, seconds});
    };

    updateDifference(); // Update immediately on mount

    const intervalId = setInterval(updateDifference, 1000);

    return () => clearInterval(intervalId);
  }, [startTime]);

  return (
    <View>
      <Text
        style={[{fontSize: 16, fontFamily: 'SFUIText-Medium', color: color}]}>
        {`${timeDifference.minutes}:${timeDifference.seconds
          .toString()
          .padStart(2, '0')}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: '#24262E',
  },
  nativeBlueSFMed: {
    fontFamily: 'SFUIText-Medium',
    color: '#00B0FF',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default Duration;
