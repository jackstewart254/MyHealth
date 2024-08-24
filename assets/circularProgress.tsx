import React from 'react';
import {View, StyleSheet} from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

const CircularPercentageTracker = ({value}) => {
  return (
    <View style={styles.container}>
      <CircularProgress
        radius={23}
        value={value}
        maxValue={7}
        initialValue={0}
        title={`${String(value)}/7`}
        activeStrokeColor={'#02BC86'}
        inActiveStrokeColor={'#24262E'}
        inActiveStrokeWidth={7}
        activeStrokeWidth={7}
        showProgressValue={false}
        titleFontSize={14}
        titleColor="#24262E"
        titleStyle={{fontFamily: 'SFUIText-Medium'}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CircularPercentageTracker;
