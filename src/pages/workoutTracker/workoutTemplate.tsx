import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  SafeAreaView,
  Text,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import {
  ChevronDown,
  Cross,
  Pause,
  Tick,
} from '../../../assets/svgs/workoutTrackerSvgs';
const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;
import {useQuery} from '@tanstack/react-query';
import {fetchExercises} from '../../../hooks/fetch';
import {useWorkoutTracker} from '../../../contexts/workoutTracker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {format} from 'date-fns/format';
import {
  fetchSets,
  getExercise,
  getTemplates,
} from '../../../localStorage/fetch';
import {
  checkIfPresent,
  setActiveWorkoutState,
  setStoreExercise,
  storeExercise,
  storeSessionInstance,
  storeSets,
  storeTemplate,
} from '../../../localStorage/insert';
import {differenceInMinutes, differenceInSeconds} from 'date-fns';
import AddExerciseModal from './addExerciseModal';
import Duration from './durationComponent';
import {insertWorkout} from '../../../hooks/insert';
import ConnectionStatus from '../../components/connectionStatus';
import useConnectionStatus from '../../components/connectionStatus';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateWorkout = () => {
  const [exerciseArr, setExerciseArr] = useState([]);
  const [set, setSet] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();
  const [addExerciseModal, setAddExerciseModal] = useState(false);
  const [closeAddExerciseModal, setCloseAddExerciseModal] = useState(false);
  const [edit, setEdit] = useState(false);
  const [template, setTemplate] = useState('');
  const [close, setClose] = useState(false);
  const {isConnected, connectionType} = useConnectionStatus();
  const [restTime, setRestTime] = useState(String);

  useEffect(() => {}, [isConnected]);

  useEffect(() => {
    if (workoutTracker.newExercise === true) {
      setWorkoutTracker({...workoutTracker, newExercise: false});
    }
  }, [workoutTracker.newExercise]);

  useEffect(() => {
    setActiveWorkoutState({
      ongoing: workoutTracker.activeWorkout,
      startTime: workoutTracker.activeWorkoutStartTime,
      template: {
        name: template,
        exercises: exerciseArr,
        sets: set,
        date: '',
        duration: 0,
        id: workoutTracker.activeWorkoutTemplate.id,
        session_num: 0,
      },
    });
  }, [set, exerciseArr, template]);

  useEffect(() => {
    if (workoutTracker.activeWorkout === true) {
      setExerciseArr(workoutTracker.activeWorkoutTemplate.exercises);
      const sortedSets = workoutTracker.activeWorkoutTemplate.sets.sort(
        (a, b) => {
          // Compare the created_at dates
          return a.order - b.order;
        },
      );
      setSet(sortedSets);
      setTemplate(workoutTracker.activeWorkoutTemplate.name);
      setActiveWorkoutState({
        ongoing: true,
        startTime: workoutTracker.activeWorkoutStartTime,
        template: workoutTracker.activeWorkoutTemplate,
      });
    }
  }, [workoutTracker.activeWorkout]);

  useEffect(() => {
    workoutTracker;
  });

  useEffect(() => {
    if (workoutTracker.slideView === 'edit') {
      setTemplate(workoutTracker.currentTemplate.name);
      setExerciseArr(workoutTracker.currentTemplate.exercises);
      const sortedSets = workoutTracker.currentTemplate.sets.sort((a, b) => {
        // Compare the created_at dates
        return new Date(a.created_at) - new Date(b.created_at);
      });
      setSet(sortedSets);
    }
    if (workoutTracker.slideView === 'create') {
      setExerciseArr([]);
      setSet([]);
      setTemplateName('');
    }
  }, [workoutTracker.slideView, workoutTracker.currentTemplate]);

  useEffect(() => {
    const exercise = workoutTracker.exercise;
    let isPresent = false;
    if (exercise.id > 0) {
      for (let i = 0; i < exerciseArr.length; i++) {
        if (exercise.id === exerciseArr[i].id) {
          isPresent = true;
        }
      }
      if (isPresent === false) {
        setExerciseArr(prevArr => [...prevArr, workoutTracker.exercise]);
        setWorkoutTracker({...workoutTracker, exercise: {id: 0, name: ''}});
      } else {
        setWorkoutTracker({...workoutTracker, exercise: {id: 0, name: ''}});
      }
    }
  }, [workoutTracker.exercise]);

  const getPrevious = async (xId, order) => {
    const current = new Date();
    const sessions = JSON.parse(await AsyncStorage.getItem('sessions'));

    if (!sessions || sessions.length === 0) {
      return;
    }

    let closestSession = null;
    let smallestDifference = Infinity;

    for (let i = 0; i < sessions.length; i++) {
      const sessionTime = new Date(sessions[i].date);
      const difference = Math.abs(current - sessionTime);
      const exercise = sessions[i].exercises.find(x => x.id === xId);
      const xSets = sessions[i].sets.filter(set => set.exercise_id === xId);

      if (
        difference < smallestDifference &&
        exercise !== undefined &&
        xSets.length > 0
      ) {
        smallestDifference = difference;
        closestSession = sessions[i];
        console.log(format(sessionTime, 'mm:hh:dd'));
      }
    }
    if (closestSession !== null) {
      const sets = closestSession.sets.filter(x => x.order === order);
      if (sets.length > 0) {
        const one = sets.find(o => o.order === order);
        if (order !== undefined) {
          console.log(one);
          return one;
        }
      }
    } else {
      return;
    }
  };

  const setTemplateName = (name: string) => {
    setTemplate(name);
  };

  const generateRandomID = () => {
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += Math.floor(Math.random() * 10); // Generates a random number between 0 and 9
    }
    return parseInt(id, 10);
  };

  const handleAddSet = async (id: number, type) => {
    const exerciseSet = set.filter(item => id === item.exercise_id);
    const present = exerciseSet.find(
      exercise => exerciseSet.length - 1 === exercise.order,
    );
    const res = await getPrevious(id, exerciseSet.length);
    console.log(res);
    const prev =
      res !== undefined
        ? type === 0
          ? String(res.weight) + 'kg' + ' x ' + String(res.reps)
          : type === 1
          ? String(res.distance) + 'km' + ' ' + String(res.duration)
          : type === 2
          ? String(res.weight) + 'kg' + ' x ' + String(res.weight)
          : String(res.duration) + 'seconds'
        : null;

    const val = generateRandomID();
    const date = String(new Date());
    let setObject = {
      session_num: workoutTracker.activeWorkoutTemplate.session_num,
      id: val,
      exercise_id: id,
      weight: present !== undefined ? present.weight : '0',
      reps: present !== undefined ? present.reps : '0',
      order: exerciseSet.length,
      created_at: new Date(),
      isFinished: false,
      distance: present !== undefined ? present.distance : '0',
      duration: present !== undefined ? present.duration : '0',
      previous: prev,
      rest: {start: date, end: date},
      pause: false,
    };
    let newArr = [...set, setObject];
    newArr.sort((a, b) => a.order - b.order);
    setSet(newArr);
  };

  const updateArrayElementWeight = (id: number, weight: string) => {
    const numericValue = weight === '' ? '' : parseInt(weight, 10);
    if (isNaN(numericValue)) {
      return;
    }

    setSet(prevSets =>
      prevSets.map(set =>
        set.id === id ? {...set, weight: numericValue} : set,
      ),
    );
  };

  const handleIsFinished = (id: number, state: number) => {
    setRestTime(String(new Date()));
    if (edit === true) {
      removeElement(id);
    } else {
      if (state === 0) {
        const newArray = set.map(item => {
          if (item.id === id) {
            return {
              ...item,
              pause: true,
              rest: {start: restTime, end: String(new Date())},
            };
          }
          return item;
        });

        newArray.sort((a, b) => a.order - b.order);
        setSet(newArray);
      }
      if (state === 1) {
        const newArray = set.map(item => {
          if (item.id === id) {
            return {
              ...item,
              isFinished: !item.isFinished,
            };
          }
          return item;
        });

        newArray.sort((a, b) => a.order - b.order);
        setSet(newArray);
      }
    }
  };

  const handleEndWorkout = () => {
    const id = generateRandomID();
    let newSet = [];

    for (let i = 0; i < set.length; i++) {
      let currentObject = set[i];
      let updatedObject = {...currentObject, id: generateRandomID()};
      newSet.push(updatedObject);
    }

    storeSessionInstance({
      name: template,
      exercises: exerciseArr,
      sets: newSet,
      date: workoutTracker.activeWorkoutStartTime,
      duration: differenceInMinutes(
        new Date(),
        workoutTracker.activeWorkoutStartTime,
      ),
      template_id: workoutTracker.activeWorkoutTemplate.id,
      id: id,
    });
    insertWorkout({
      name: template,
      exercises: exerciseArr,
      sets: newSet,
      date: workoutTracker.activeWorkoutStartTime,
      duration: differenceInMinutes(
        new Date(),
        workoutTracker.activeWorkoutStartTime,
      ),
      template_id: workoutTracker.activeWorkoutTemplate.id,
      id: id,
    });
    storeSets(newSet);
    setActiveWorkoutState({
      ongoing: false,
      startTime: '',
      templateID: {
        name: '',
        exercises: [],
        sets: [],
        date: '',
        duration: 0,
        template_id: workoutTracker.activeWorkoutTemplate.id,
        id: generateRandomID(),
      },
    });
    setWorkoutTracker({
      ...workoutTracker,
      activeWorkout: false,
      activeWorkoutStartTime: '',
      closeSlide: true,
      showWorkoutComplete: true,
    });
  };

  const handleSavingWorkout = async () => {
    const genId = generateRandomID();
    if (template.length < 1) {
      Alert.alert('You must name your workout!');
    } else {
      const obj = {
        name: template,
        exercises: exerciseArr,
        sets: set,
        date: '',
        duration: 0,
        id:
          workoutTracker.slideView === 'edit'
            ? workoutTracker.currentTemplate.id
            : genId,
        session_num: 0,
      };
      if (workoutTracker.slideView === 'edit') {
        await checkIfPresent(workoutTracker.currentTemplate.id, obj);
        setWorkoutTracker({
          ...workoutTracker,
          closeSlide: true,
        });
      }
      if (workoutTracker.slideView === 'create') {
        await storeTemplate('templates', obj);
        setWorkoutTracker({
          ...workoutTracker,
          closeSlide: true,
          newWorkout: obj,
        });
      }
    }
  };

  const updateArrayElementReps = (id: number, weight: string) => {
    const numericValue = weight === '' ? '' : parseInt(weight, 10);
    if (isNaN(numericValue)) {
      return;
    }

    setSet(prevSets =>
      prevSets.map(set => (set.id === id ? {...set, reps: numericValue} : set)),
    );
  };

  const updateSet = (id: number, newVal: string, prop: string) => {
    const numericValue = newVal === '' ? '' : parseInt(newVal, 10);
    if (isNaN(numericValue)) {
      return;
    }
    setSet(prevSets =>
      prevSets.map(set =>
        set.id === id ? {...set, [prop]: numericValue} : set,
      ),
    );
  };

  const handleClose = () => {
    setClose(false);
    setWorkoutTracker({...workoutTracker, closeSlide: true});
  };

  const closeButton = () => {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          zIndex: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            backgroundColor: 'black',
            opacity: 0.3,
            width: '100%',
            height: '100%',
          }}
        />
        <View
          style={{
            position: 'absolute',
            zIndex: 3,
            width: 200,
            // height: 120,
            backgroundColor: '#24262E',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'white',
            flexDirection: 'column',
            padding: 10,
            alignItems: 'center',
          }}>
          <Text style={[styles.medSF, {fontSize: 16, paddingBottom: 10}]}>
            Are you sure?
          </Text>
          <View
            style={{
              width: '100%',
              height: 1,
              backgroundColor: '#D9D9D9',
              marginBottom: 10,
            }}
          />
          <View style={{width: '100%', flexDirection: 'row'}}>
            <TouchableOpacity
              role="button"
              style={[{width: '50%'}]}
              onPress={handleClose}>
              <Text style={[{fontSize: 16, textAlign: 'center'}, styles.medSF]}>
                Yes
              </Text>
            </TouchableOpacity>
            <View
              style={{width: 1, height: '100%', backgroundColor: '#D9D9D9'}}
            />
            <TouchableOpacity
              role="button"
              style={[{width: '50%'}]}
              onPress={() => {
                setClose(false);
              }}>
              <Text style={[{fontSize: 16, textAlign: 'center'}, styles.medSF]}>
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const removeElement = id => {
    const newList = set.filter(set => id !== set.id);
    setSet(newList);
  };

  const handleDeleteExercise = id => {
    const filter = exerciseArr.filter(e => id !== e.id);
    const sets = set.filter(s => id !== s.exercise_id);
    setSet(sets);
    setExerciseArr(filter);
  };

  const renderExercises = ({item, index}: {item: object; index: number}) => {
    const setsForExercise =
      set.filter(setObject => setObject.exercise_id === item.id) || [];

    const exerciseType = item.type;

    return (
      <View style={{flexDirection: 'column', paddingBottom: 10}}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            paddingVertical: 10,
          }}>
          <Text style={[styles.blueSemiboldSF]}>
            {item.name}{' '}
            {(item.bar_type === 1 && '(Barbell)') ||
              (item.bar_type == 2 && '(Dumbbell)')}
          </Text>
          <TouchableOpacity
            onPress={() => {
              handleDeleteExercise(item.id);
            }}>
            <Text style={[styles.redSemiboldSF]}>Delete</Text>
          </TouchableOpacity>
        </View>
        <View
          key={index}
          style={{
            width: '100%',
            flexDirection: 'row',
            paddingBottom: 10,
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              width: width * 0.06,
              height: 30,
              // backgroundColor: '#A7A8AB',
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={[styles.semiboldSF, {fontSize: 16}]}>Set</Text>
          </View>
          <View
            style={{
              width:
                (exerciseType === 3 && width * 0.23) ||
                (exerciseType === 0 && width * 0.23) ||
                (exerciseType === 2 && width * 0.23) ||
                (exerciseType === 1 && width * 0.23),
              height: 30,
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={[styles.semiboldSF, {fontSize: 16}]}>Previous</Text>
          </View>
          <View
            style={{
              width:
                (exerciseType === 3 && width * 0.16) ||
                (exerciseType === 0 && width * 0.16) ||
                (exerciseType === 2 && width * 0.16) ||
                (exerciseType === 1 && width * 0.16),
              height: 30,
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={[styles.semiboldSF, {fontSize: 16}]}>Rest</Text>
          </View>
          <View
            style={{
              overflow: 'hidden',
              width:
                (exerciseType === 3 && width * 0.25) ||
                (exerciseType === 0 && width * 0.11) ||
                (exerciseType === 2 && width * 0.11) ||
                (exerciseType === 1 && width * 0.11),
              height: 30,
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={[styles.semiboldSF, {fontSize: 16}]}>
              {(exerciseType === 0 && 'kg') ||
                (exerciseType === 1 && 'km') ||
                (exerciseType === 2 && 'kg') ||
                (exerciseType === 3 && 'Time')}
            </Text>
          </View>
          {item.type !== 3 && (
            <View
              style={{
                overflow: 'hidden',
                width:
                  (exerciseType === 3 && 0) ||
                  (exerciseType === 0 && width * 0.11) ||
                  (exerciseType === 2 && width * 0.11) ||
                  (exerciseType === 1 && width * 0.11),
                height: 30,
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={[styles.semiboldSF, {fontSize: 16}]}>
                {(exerciseType === 0 && 'Reps') ||
                  (exerciseType === 1 && 'Time') ||
                  (exerciseType === 2 && 'Reps')}
              </Text>
            </View>
          )}
          <View
            style={{
              width: width * 0.07,
              height: 30,
            }}
          />
        </View>
        {setsForExercise.map((set, index) => {
          return (
            <View
              key={set.id}
              style={{
                width: '100%',
                flexDirection: 'row',
                paddingBottom: 10,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  width: width * 0.06,
                  height: 30,
                  backgroundColor: set.isFinished
                    ? '#02BC86'
                    : set.pause === true
                    ? '#FFA800'
                    : '#A7A8AB',
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={[styles.medSF, {fontSize: 14}]}>{index + 1}</Text>
              </View>
              <View
                style={{
                  width:
                    (exerciseType === 3 && width * 0.23) ||
                    (exerciseType === 0 && width * 0.23) ||
                    (exerciseType === 2 && width * 0.23) ||
                    (exerciseType === 1 && width * 0.23),
                  height: 30,
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: set.isFinished
                    ? '#02BC86'
                    : set.pause === true
                    ? '#FFA800'
                    : '#A7A8AB',
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: 'white',
                    fontFamily: 'SFUIText-Semibold',
                  }}>
                  {set.previous === null ? 'n/a' : set.previous}
                </Text>
              </View>
              <View
                style={{
                  width:
                    (exerciseType === 3 && width * 0.16) ||
                    (exerciseType === 0 && width * 0.16) ||
                    (exerciseType === 2 && width * 0.16) ||
                    (exerciseType === 1 && width * 0.16),
                  height: 30,
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: set.isFinished
                    ? '#02BC86'
                    : set.pause === true
                    ? '#FFA800'
                    : '#A7A8AB',
                }}>
                {index === 0 ? (
                  <Text
                    style={{
                      fontSize: 14,
                      color: 'white',
                      fontFamily: 'SFUIText-Medium',
                    }}>
                    0:00
                  </Text>
                ) : setsForExercise[index - 1].isFinished === true &&
                  set.pause === false &&
                  set.isFinished === false ? (
                  <Duration startTime={restTime} color="white" size={14} />
                ) : (
                  <Text
                    style={{
                      fontSize: 14,
                      color: 'white',
                      fontFamily: 'SFUIText-Medium',
                    }}>
                    {differenceInMinutes(
                      new Date(set.rest.end),
                      new Date(set.rest.start),
                    )}
                    :
                    {(
                      differenceInSeconds(
                        new Date(set.rest.end),
                        new Date(set.rest.start),
                      ) % 60
                    )
                      .toString()
                      .padStart(2, '0')}
                  </Text>
                )}
              </View>
              <View
                style={{
                  overflow: 'hidden',
                  width:
                    (exerciseType === 3 && width * 0.25) ||
                    (exerciseType === 0 && width * 0.11) ||
                    (exerciseType === 2 && width * 0.11) ||
                    (exerciseType === 1 && width * 0.11),
                  height: 30,
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: set.isFinished
                    ? '#02BC86'
                    : set.pause === true
                    ? '#FFA800'
                    : '#A7A8AB',
                }}>
                <TextInput
                  placeholder={'0'}
                  placeholderTextColor={'white'}
                  style={[
                    styles.medSF,
                    {fontSize: 14, width: '100%', textAlign: 'center'},
                  ]}
                  keyboardType="numeric"
                  value={
                    (exerciseType === 3 && String(set.duration)) ||
                    (exerciseType === 0 && String(set.weight)) ||
                    (exerciseType === 1 && String(set.distance)) ||
                    (exerciseType === 2 && String(set.weight))
                  }
                  onChangeText={text => {
                    updateSet(
                      set.id,
                      text,
                      (exerciseType === 0 && 'weight') ||
                        (exerciseType === 3 && 'duration') ||
                        (exerciseType === 1 && 'distance') ||
                        (exerciseType === 2 && 'weight'),
                    );
                  }}
                  selectTextOnFocus={true}
                />
              </View>
              {exerciseType !== 3 && (
                <View
                  style={{
                    overflow: 'hidden',
                    width:
                      (exerciseType === 0 && width * 0.11) ||
                      (exerciseType === 2 && width * 0.11) ||
                      (exerciseType === 1 && width * 0.11),
                    height: 30,
                    borderRadius: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: set.isFinished
                      ? '#02BC86'
                      : set.pause === true
                      ? '#FFA800'
                      : '#A7A8AB',
                  }}>
                  <TextInput
                    placeholder={'0'}
                    placeholderTextColor={'white'}
                    keyboardType="numeric"
                    value={
                      (exerciseType === 0 && String(set.reps)) ||
                      (exerciseType === 1 && String(set.duration)) ||
                      (exerciseType === 2 && String(set.reps))
                    }
                    onChangeText={text => {
                      // updateArrayElementReps(set.id, text);
                      updateSet(
                        set.id,
                        text,
                        exerciseType === 1 ? 'duration' : 'reps',
                      );
                    }}
                    style={[
                      styles.medSF,
                      {fontSize: 14, width: '100%', textAlign: 'center'},
                    ]}
                    selectTextOnFocus={true}
                  />
                </View>
              )}
              {workoutTracker.slideView === 'active' ? (
                <TouchableOpacity
                  onPress={() => {
                    index > 0 &&
                    setsForExercise[index - 1].isFinished === true &&
                    set.pause === false
                      ? handleIsFinished(set.id, 0)
                      : handleIsFinished(set.id, 1);
                  }}
                  style={{
                    width: width * 0.07,
                    height: 30,
                    backgroundColor: edit
                      ? '#FF2A00'
                      : set.isFinished
                      ? '#02BC86'
                      : set.pause === true
                      ? '#FFA800'
                      : '#A7A8AB',
                    borderRadius: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {edit ? (
                    <Cross width={12} height={12} color="#24262E" />
                  ) : index > 0 &&
                    setsForExercise[index - 1].isFinished === true &&
                    set.pause === false &&
                    set.isFinished === false ? (
                    <Pause />
                  ) : (
                    <Tick />
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    removeElement(set.id);
                  }}
                  style={{
                    width: width * 0.07,
                    height: 30,
                    backgroundColor: '#FF2A00',
                    borderRadius: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Cross width={12} height={12} color="#24262E" />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        <TouchableOpacity
          style={{
            width: '100%',
            height: 26,
            backgroundColor: '#E5D120',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 5,
          }}
          onPress={() => {
            handleAddSet(item.id, item.type);
          }}>
          <Text style={[styles.medSF, {fontSize: 14}]}>Add set</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const toggleModal = () => {
    setWorkoutTracker({...workoutTracker, animateAddExercise: true});
  };

  const handleCloseButton = () => {
    const view = workoutTracker.slideView;
    if (view === 'edit' || view === 'create') {
      setWorkoutTracker({...workoutTracker, closeSlide: true});
      setTemplate('');
    }
    if (view === 'active') {
      setWorkoutTracker({
        ...workoutTracker,
        closeSlide: true,
        showWorkoutComplete: workoutTracker.activeWorkout === false && true,
      });
    }
  };

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        // padding: 20,
        position: 'relative',
        justifyContent: 'space-between',
      }}>
      {/* <View
        style={{height: 300, width: '100%', backgroundColor: 'blue'}}></View> */}
      {close === true && closeButton()}
      {workoutTracker.animateAddExercise === true && <AddExerciseModal />}
      <ScrollView
        style={{paddingLeft: 20, paddingRight: 20, paddingTop: 10}}
        showsVerticalScrollIndicator={false}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            //   borderWidth: 1,
            paddingBottom: 30,
          }}>
          <TextInput
            placeholder="Enter workout name"
            placeholderTextColor={'white'}
            onChangeText={val => {
              setTemplateName(val);
            }}
            value={template}
            style={[
              {
                paddingTop: 10,
                paddingBottom: 10,
                width: 260,
                fontSize: 16,
                color: 'white',
                opacity: template.length > 0 ? 1 : 0.5,
              },
              styles.semiboldSF,
            ]}
          />
          <TouchableOpacity
            onPress={() => {
              handleCloseButton();
            }}
            style={{paddingTop: 10, paddingBottom: 10, paddingLeft: 10}}>
            {workoutTracker.slideView === 'active' ? (
              <ChevronDown />
            ) : (
              <Cross width={16} height={16} color="white" />
            )}
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
          }}>
          {workoutTracker.activeWorkout === true && (
            <Duration
              startTime={workoutTracker.activeWorkoutStartTime}
              color={'white'}
            />
          )}

          {workoutTracker.slideView === 'active' && exerciseArr.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setEdit(!edit);
              }}>
              <Text
                style={[
                  styles.redSemiboldSF,
                  {
                    width: '100%',
                    textAlign: 'right',
                    fontSize: 16,
                    marginBottom: 10,
                  },
                ]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{paddingBottom: 40}}>
          <FlatList
            scrollEnabled={false}
            data={exerciseArr}
            renderItem={renderExercises}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
        <TouchableOpacity
          onPress={toggleModal}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            backgroundColor: '#00B0FF',
            borderRadius: 5,
            marginBottom: 70,
          }}>
          <Text style={[{fontSize: 15, paddingVertical: 10}, styles.medSF]}>
            Add exercise
          </Text>
        </TouchableOpacity>
        {workoutTracker.slideView === 'active' && (
          <TouchableOpacity
            onPress={handleEndWorkout}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              backgroundColor: '#FF2A00',
              borderRadius: 5,
              marginBottom: 70,
            }}>
            <Text style={[{fontSize: 15, paddingVertical: 10}, styles.medSF]}>
              End workout
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      {workoutTracker.slideView !== 'active' && (
        <TouchableOpacity
          onPress={handleSavingWorkout}
          style={{
            height: 60,
            backgroundColor: '#00B0FF',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={[styles.medSF, {fontSize: 16}]}>
            {workoutTracker.slideView === 'edit' ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  semiboldSF: {
    fontFamily: 'SFUIText-Semibold',
    color: 'white',
  },
  blueSemiboldSF: {
    fontFamily: 'SFUIText-Semibold',
    color: '#00B0FF',
    fontSize: 16,
  },
  redSemiboldSF: {
    fontFamily: 'SFUIText-Semibold',
    color: '#FF2A00',
    fontSize: 16,
  },
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
    color: '#00B0FF',
  },
});

export default CreateWorkout;
