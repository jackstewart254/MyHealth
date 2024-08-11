import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchExercises} from '../hooks/fetch';
import {getExercise} from './fetch';

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

export {setStoreExercise, clearStorage, storeTemplate};
