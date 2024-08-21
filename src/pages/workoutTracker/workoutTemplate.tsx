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
} from 'react-native';
import {
  ChevronDown,
  Cross,
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
import {getExercise, getTemplates} from '../../../localStorage/fetch';
import {
  checkIfPresent,
  setActiveWorkoutState,
  setStoreExercise,
  storeExercise,
  storeSessionInstance,
  storeSets,
  storeTemplate,
} from '../../../localStorage/insert';
import {differenceInMinutes} from 'date-fns';
import AddExerciseModal from './addExerciseModal';
import Duration from './durationComponent';

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

  const handleAddSet = (id: number) => {
    const exerciseSet = set.filter(item => id === item.exercise_id);
    const present = exerciseSet.find(
      exercise => exerciseSet.length - 1 === exercise.order,
    );
    console.log(present);
    const val = generateRandomID();
    let setObject = {
      session_num: workoutTracker.activeWorkoutTemplate.session_num,
      id: val,
      exercise_id: id,
      weight: present !== undefined ? present.weight : '',
      reps: present !== undefined ? present.reps : '',
      order: exerciseSet.length,
      created_at: new Date(),
      isFinished: false,
      distance: present !== undefined ? present.distance : '',
      duration: present !== undefined ? present.duration : '',
      calories: '',
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

  const handleIsFinished = (id: number) => {
    if (edit === true) {
      removeElement(id);
    } else {
      // Use map to create a new array with the updated element
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
  };

  const handleSavingWorkout = async () => {
    const genId = generateRandomID();
    if (template.length < 1) {
      console.error("Error: Can't save a template without a name");
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
    console.log(prop);
    console.log(newVal);
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
    console.log(exerciseType);
    console.log(item.bar_type);

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
            justifyContent: 'space-between',
            paddingBottom: 10,
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
                (exerciseType === 3 && width * 0.33) ||
                (exerciseType === 0 && width * 0.45) ||
                (exerciseType === 1 && width * 0.33),
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
                (exerciseType === 3 && width * 0.34) ||
                (exerciseType === 0 && width * 0.115) ||
                (exerciseType === 1 && width * 0.18),
              height: 30,
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={[styles.semiboldSF, {fontSize: 16}]}>
              {(exerciseType === 3 && 'Duration') ||
                (exerciseType === 0 && 'kg') ||
                (exerciseType === 1 && 'km')}
            </Text>
          </View>
          <View
            style={{
              overflow: 'hidden',
              width:
                (exerciseType === 3 && width * 0) ||
                (exerciseType === 0 && width * 0.09) ||
                (exerciseType === 1 && width * 0.14),
              height: 30,
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={[styles.semiboldSF, {fontSize: 16}]}>
              {exerciseType === 0 ? 'Reps' : 'Time'}
            </Text>
          </View>
          <View
            style={{
              width: width * 0.07,
              height: 30,
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={[styles.medSF, {fontSize: 14}]}></Text>
          </View>
        </View>
        {setsForExercise.map((set, index) => {
          return (
            <View
              key={set.id}
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingBottom: 10,
              }}>
              <View
                style={{
                  width: width * 0.06,
                  height: 30,
                  backgroundColor: set.isFinished ? '#02BC86' : '#A7A8AB',
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={[styles.medSF, {fontSize: 14}]}>{index + 1}</Text>
              </View>
              <View
                style={{
                  width:
                    (exerciseType === 3 && width * 0.34) ||
                    (exerciseType === 0 && width * 0.45) ||
                    (exerciseType === 1 && width * 0.33),
                  height: 30,
                  backgroundColor: set.isFinished ? '#02BC86' : '#A7A8AB',
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={[styles.medSF, {fontSize: 14}]}></Text>
              </View>
              <View
                style={{
                  width:
                    (exerciseType === 3 && width * 0.34) ||
                    (exerciseType === 0 && width * 0.115) ||
                    (exerciseType === 1 && width * 0.18),
                  height: 30,
                  backgroundColor: set.isFinished ? '#02BC86' : '#A7A8AB',
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
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
                    (exerciseType === 1 && String(set.distance))
                  }
                  onChangeText={text => {
                    updateSet(
                      set.id,
                      text,
                      (exerciseType === 0 && 'weight') ||
                        (exerciseType === 3 && 'duration') ||
                        (exerciseType === 1 && 'distance'),
                    );
                  }}
                  selectTextOnFocus={true}
                />
              </View>
              {exerciseType !== 3 && (
                <View
                  style={{
                    width:
                      (exerciseType === 3 && 0) ||
                      (exerciseType === 0 && width * 0.09) ||
                      (exerciseType === 1 && width * 0.14),
                    height: 30,
                    backgroundColor: set.isFinished ? '#02BC86' : '#A7A8AB',
                    borderRadius: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <TextInput
                    placeholder={'0'}
                    placeholderTextColor={'white'}
                    keyboardType="numeric"
                    value={
                      (exerciseType === 0 && String(set.reps)) ||
                      (exerciseType === 1 && String(set.duration))
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
                    handleIsFinished(set.id);
                  }}
                  style={{
                    width: width * 0.07,
                    height: 30,
                    backgroundColor: edit
                      ? '#FF2A00'
                      : set.isFinished
                      ? '#02BC86'
                      : '#A7A8AB',
                    borderRadius: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {edit ? (
                    <Cross width={12} height={12} color="#24262E" />
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
            handleAddSet(item.id);
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
            onPress={() => {
              storeSets(set);
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
              storeSessionInstance({
                name: template,
                exercises: exerciseArr,
                sets: set,
                date: workoutTracker.activeWorkoutStartTime,
                duration: differenceInMinutes(
                  new Date(),
                  workoutTracker.activeWorkoutStartTime,
                ),
                template_id: workoutTracker.activeWorkoutTemplate.id,
                id: generateRandomID(),
              });
              setWorkoutTracker({
                ...workoutTracker,
                activeWorkout: false,
                // activeWorkoutTemplate: 0,
                activeWorkoutStartTime: '',
                closeSlide: true,
                showWorkoutComplete: true,
              });
            }}
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
