import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchExercises} from '../hooks/fetch';
import {getExercise, getTemplates} from './fetch';
import { useWorkoutTracker } from '../contexts/workoutTracker';

const storeExercise = async (key, newData) => {
  try {
    const jsonValue = await AsyncStorage.getItem('exercise');
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
    const present = existingExercises.find(item => item.id === res[i].id);
    if (!present) {
      existingExercises.push(res[i]);
    }
  }
  await AsyncStorage.setItem('exercise', JSON.stringify(existingExercises));
};

const storeNewExercise = async exercise => {
  const res = await getExercise('exercise');
  const parse =
    typeof res === 'string' && res !== null ? JSON.parse(res) : res || [];
  parse.push(exercise);
  await AsyncStorage.setItem('exercise', JSON.stringify(parse));
};

const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing AsyncStorage', error);
  }
};

const clearKey = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
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
  } catch (error) {
    console.error('Error updating templates:', error);
  }
};

const setActiveWorkoutState = async information => {
  try {
    await AsyncStorage.setItem('activeWorkout', JSON.stringify(information));
  } catch (error) {
    console.error('Error storing data in array', error);
  }
};

const storeSessionInstance = async sessionInstance => {
  try {
    const jsonValue = await AsyncStorage.getItem('sessions');
    let dataArray = jsonValue != null ? JSON.parse(jsonValue) : [];
    dataArray.push(sessionInstance);
    await AsyncStorage.setItem('sessions', JSON.stringify(dataArray));
  } catch (error) {
    console.error('Error storing data in array', error);
  }
};

const storeSets = async sets => {
  const filteredSets = sets.filter(set => set.isFinished === true);
  const res = await AsyncStorage.getItem('sets');
  let newSets = res !== null ? JSON.parse(res) : [];
  for (let i = 0; i < filteredSets.length; i++) {
    newSets.push(filteredSets[i]);
  }
  await AsyncStorage.setItem('sets', JSON.stringify(newSets));
};

const storeUser = async object => {
  await AsyncStorage.setItem('user', JSON.stringify(object));
};

const fetchUser = async () => {
  const res = await AsyncStorage.getItem('user');
  return res;
};

const storeFCM = async fcm => {
  console.log('handle', fcm)
  await AsyncStorage.setItem('fcm', fcm);
};

const storeAuth = async auth => {
  await AsyncStorage.setItem('auth', JSON.stringify(auth));
};

export {
  setStoreExercise,
  clearStorage,
  storeTemplate,
  clearKey,
  checkIfPresent,
  storeExercise,
  setActiveWorkoutState,
  storeSessionInstance,
  storeSets,
  storeNewExercise,
  storeUser,
  fetchUser,
  storeFCM,
  storeAuth,
};
