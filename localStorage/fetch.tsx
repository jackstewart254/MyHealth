import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

const getExercise = async key => {
  try {
    const value = await AsyncStorage.getItem('exercise');
    if (value !== null) {
      const parsedValue = JSON.parse(value); // Parse the JSON string
      return parsedValue;
    }
    return null; // In case value is null
  } catch (error) {
    return null; // Return null in case of error
  }
};

const getTemplates = async key => {
  //   try {
  //   const value = await AsyncStorage.getItem(key);
  const jsonValue = await AsyncStorage.getItem(key);
  let dataArray = jsonValue != null ? JSON.parse(jsonValue) : [];
  return dataArray;
  //     if (value !== null) {
  //       const parsedValue = JSON.parse(value); // Parse the JSON string
  //       return parsedValue;
  //     }
  //     return null; // In case value is null
  //   } catch (error) {
  //     return null; // Return null in case of error
  //   }
};

const fetchActiveWorkout = async () => {
  const res = await AsyncStorage.getItem('activeWorkout');
  return res;
};

const fetchSessions = async () => {
  const res = await AsyncStorage.getItem('sessions');
  const data = res != null ? JSON.parse(res) : [];
  return data;
};

const removeElement = async () => {};

const fetchSets = async id => {
  const res = await AsyncStorage.getItem('sets');
  const data = res !== null ? JSON.parse(res) : [];
  const filteredValue = data.filter(set => id === set.exercise_id);
  return filteredValue;
};

// const fetch;

// const fetchSpecificSets = async (id: ) => {

// }

export {
  getExercise,
  getTemplates,
  fetchActiveWorkout,
  fetchSessions,
  fetchSets,
};
