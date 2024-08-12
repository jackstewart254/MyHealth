import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchExercises} from '../hooks/fetch';
import {getExercise, getTemplates} from './fetch';
import { useWorkoutTracker } from '../contexts/workoutTracker';

const storeExercise = async (key, newData) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    let dataArray = jsonValue != null ? JSON.parse(jsonValue) : [];
    dataArray.push(newData);
    await AsyncStorage.setItem(key, JSON.stringify(dataArray));
  } catch (error) {
    console.error('Error storing data in array', error);
  }
};

const storeTemplate = async (key, templateObject) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    let dataArray = jsonValue != null ? JSON.parse(jsonValue) : [];
    dataArray.push(templateObject);
    await AsyncStorage.setItem(key, JSON.stringify(dataArray));
  } catch (error) {
    console.error('Error storing data in array', error);
  }
  const check = await getExercise(key);
  console.log('Added: \n', check);
};

const storeNewTemplateArray = async (key, templateArray) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(templateArray));
  } catch (error) {
    console.error('Error storing data in array', error);
  }
};

const setStoreExercise = async () => {
  const res = await fetchExercises();
  const localRes = await getExercise('exercise');
  const existingExercises = Array.isArray(localRes) ? localRes : [];
  for (let i = 0; i < res?.length; i++) {
    const exerciseObject = {name: res[i].exercise, id: res[i].id};
    const present = existingExercises.find(item => item.id === res[i].id);
    if (!present) {
      await storeExercise('exercise', exerciseObject);
    }
  }
};

const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage successfully cleared');
  } catch (error) {
    console.error('Error clearing AsyncStorage', error);
  }
};

const clearKey = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`Data under key "${key}" has been removed.`);
  } catch (error) {
    console.error('Error clearing key:', error);
  }
};

const checkIfPresent = async (id, template) => {
  try {
    const localRes = await getTemplates('templates');
    const newArray = localRes.filter(object => object.id !== id);
    newArray.push(template);
    await storeNewTemplateArray('templates', newArray);
    console.log('Updated templates:', newArray);
  } catch (error) {
    console.error('Error updating templates:', error);
  }
};

export {
  setStoreExercise,
  clearStorage,
  storeTemplate,
  clearKey,
  checkIfPresent,
};
