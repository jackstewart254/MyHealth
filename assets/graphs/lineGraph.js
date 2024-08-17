import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions, View, Text } from 'react-native';

const LineChartExample = () => {
  const screenWidth = Dimensions.get('window').width;

  const data = {
    labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [
      {
        data: [20, 85, 90, 95, 100, 110, 120],
        strokeWidth: 1,
      },
    ],
  };

  return (
    <View>
      <LineChart
        data={data}
        width={screenWidth-40} // from react-native
        height={160}
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundColor: '#24262E',
          backgroundGradientFrom: '#24262E',
          backgroundGradientTo: '#24262E',
          decimalPlaces: 1,
          color: (opacity = 1) => 'white', // Line color remains orange
          labelColor: (opacity = 1) => 'white',
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '1',
            stroke: '#000000',
          },
          propsForBackgroundLines: {
            strokeWidth: 1,
            strokeDasharray: 'true',
          },
          fillShadowGradient: '#24262E', // Match the background to hide the fill
          fillShadowGradientOpacity: 0,
          fillShadowGradientFrom: '#24262E',
          fillShadowGradientTo: '#24262E'

        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

export default LineChartExample;
