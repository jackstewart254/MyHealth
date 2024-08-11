import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

const getExercise = async key => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      const parsedValue = JSON.parse(value); // Parse the JSON string
      console.log('Data retrieved:', parsedValue);
      return parsedValue;
    }
    return null; // In case value is null
  } catch (error) {
    console.error('Error retrieving data', error);
    return null; // Return null in case of error
  }
};

const getTemplates = async key => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      const parsedValue = JSON.parse(value); // Parse the JSON string
      console.log('Data retrieved:', parsedValue);
      return parsedValue;
    }
    return null; // In case value is null
  } catch (error) {
    console.error('Error retrieving data', error);
    return null; // Return null in case of error
  }
};

export {getExercise, getTemplates};
