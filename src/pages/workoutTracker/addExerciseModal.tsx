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
  storeNewExercise,
  storeSessionInstance,
  storeTemplate,
} from '../../../localStorage/insert';
import {differenceInMinutes} from 'date-fns';

const AddExerciseModal = () => {
  const [exerciseVal, setExerciseVal] = useState('');
  const opacity = useSharedValue(0);
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();
  const [animationToggle, setAnimationToggle] = useState(false);
  const [close, setClose] = useState(false);
  const [addNewVal, setAddNewVal] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const types = [
    {id: 0, type: 'Weight'},
    {id: 1, type: 'Cardio'},
    {id: 2, type: 'Body'},
    {id: 3, type: 'Stretch'},
  ];

  const [selection, setSelection] = useState(-1);

  const bar_type = [
    {id: 0, type: 'None'},
    {id: 1, type: 'Barbell'},
    {id: 2, type: 'Dumbbell'},
    {id: 3, type: 'Cable'},
    {id: 4, type: 'Resistance Band'},
  ];
  const [newObject, setNewObject] = useState({
    bar_type: -1,
    id: -1,
    name: '',
    type: -1,
    muscle: -1,
  });

  const muscle = [
    'Back',
    'Arms',
    'Chest',
    'Shoulders',
    'Legs',
    'Cardio',
    'Core',
  ];

  useEffect(() => {
    if (workoutTracker.animateAddExercise === true) {
      opacity.value = withTiming(1, {duration: 200});
    }
  }, [workoutTracker.animateAddExercise]);

  useEffect(() => {
    handleGetExercise();
  }, [workoutTracker.newExercise]);

  useEffect(() => {
    if (selection > -1) {
      const filteredSet = exercises.filter(x => x.muscle === selection);
      setFilteredExercises(filteredSet);
    } else {
      setFilteredExercises(exercises);
    }
  }, [selection]);

  useEffect(() => {
    if (close === true) {
      opacity.value = withTiming(0, {duration: 200});
      const timer = setTimeout(() => {
        setWorkoutTracker({...workoutTracker, animateAddExercise: false});
      }, 200);
      setClose(false);
    }
  }, [close]);

  useEffect(() => {
    handleGetExercise();
  }, []);

  useEffect(() => {
    if (refresh === true) {
      handleGetExercise();
      setRefresh(false);
    }
  }, [refresh]);

  const handleGetExercise = async () => {
    const res = await getExercise('exercise');
    setExercises(res);
    setFilteredExercises(res);
    setSelection(-1);
  };

  const setValue = (text: string) => {
    setAddNewVal(text);
  };

  const handleAddExercise = ({exercise}: {exercise: object}) => {
    setWorkoutTracker({...workoutTracker, exercise: exercise});
    setClose(true);
  };

  const animatedOpacity = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const generateRandomID = () => {
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += Math.floor(Math.random() * 10); // Generates a random number between 0 and 9
    }
    return parseInt(id, 10);
  };

  const addExercise = async () => {
    if (
      addNewVal.length > 0 &&
      newObject.bar_type > -1 &&
      newObject.muscle > -1 &&
      newObject.type > -1
    ) {
      const id = generateRandomID();
      const exercise = {
        id: id,
        name: addNewVal,
        type: newObject.type,
        bar_type: newObject.bar_type,
      };
      storeNewExercise(exercise);
      handleAddExercise({exercise: exercise});
      setNewObject({
        id: -1,
        name: '',
        type: -1,
        bar_type: -1,
        muscle: -1,
      });
    } else {
      Alert.alert(
        'Ensure you have given the exercise a name and checked each box',
      );
    }
    setRefresh(true);
  };

  useEffect(() => {
    if (exerciseVal.length === 0) {
      handleGetExercise();
    } else {
      const findMatchingNames = (searchValue, array) => {
        return array.filter(item =>
          item.name.toLowerCase().includes(searchValue.toLowerCase()),
        );
      };
      setFilteredExercises(findMatchingNames(exerciseVal, exercises));
      setSelection(-1);
    }
  }, [exerciseVal]);

  const renderExercises = () => {
    return (
      <View style={{flex: 1}}>
        <View style={{paddingHorizontal: 10, width: '100%'}}>
          {showAddNew ? (
            <View
              style={{
                width: '100%',
                backgroundColor: '#353535',
                marginBottom: 20,
                borderRadius: 5,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <TextInput
                placeholder="Enter exercise"
                placeholderTextColor={'#7D7D7D'}
                value={addNewVal}
                onChangeText={text => {
                  setValue(text);
                }}
                style={{
                  fontSize: 14,
                  padding: 10,
                  width: '81.1%',
                  fontFamily: 'SFUIText-Medium',
                  color: '#24262E',
                }}
              />
              <TouchableOpacity
                onPress={addExercise}
                style={{
                  width: '16%',
                  borderRadius: 5,
                  backgroundColor: '#00B0FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: 5,
                }}>
                <Text style={[styles.medSF, {fontSize: 14}]}>Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TextInput
              style={{
                paddingVertical: 10,
                paddingHorizontal: 10,
                width: '100%',
                backgroundColor: '#E2E2E2',
                borderRadius: 5,
                fontSize: 14,
                marginBottom: 10,
                fontFamily: 'SFUIText-Medium',
                color: '#24262E',
              }}
              placeholder="Search"
              placeholderTextColor={'#7D7D7D'}
              value={exerciseVal}
              onChangeText={text => {
                setExerciseVal(text);
              }}
            />
          )}
        </View>
        <ScrollView
          horizontal={true}
          contentContainerStyle={{
            flexDirection: 'row',
            marginBottom: 10,
            paddingHorizontal: 10,
          }}
          style={{flexGrow: 0, flexShrink: 0}}>
          <TouchableOpacity
            onPress={() => {
              setSelection(-1);
            }}
            style={{
              padding: 10,
              backgroundColor: selection === -1 ? '#00B0FF' : '#D9D9D9',
              borderRadius: 10,
              marginRight: 10,
            }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'SFUIText-Medium',
                color: selection === -1 ? 'white' : '#24262E',
              }}>
              All
            </Text>
          </TouchableOpacity>
          {muscle.map((m, index) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  setSelection(index);
                }}
                key={index}
                style={{
                  padding: 10,
                  backgroundColor: selection === index ? '#00B0FF' : '#D9D9D9',
                  borderRadius: 10,
                  marginRight: 10,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'SFUIText-Medium',
                    color: selection === index ? 'white' : '#24262E',
                  }}>
                  {m}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View
          style={{
            width: '100%',
            height: 1,
            backgroundColor: '#D9D9D9',
          }}
        />
        <ScrollView
          style={{
            flexDirection: 'column',
            paddingHorizontal: 10,
          }}>
          {filteredExercises?.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                onPress={() => {
                  handleAddExercise({exercise: item});
                }}
                style={{
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  // paddingVertical: 10,
                }}>
                <Text
                  style={[
                    {
                      fontSize: 14,
                      paddingVertical: 14,
                      width: '100%',
                      flexDirection: 'row',
                    },
                    styles.medSF,
                  ]}>
                  {item.name}{' '}
                  {(item.bar_type === 1 && '(Barbell)') ||
                    (item.bar_type === 2 && '(Dumbbell)') ||
                    (item.bar_type === 3 && '(Cable)') ||
                    (item.type === 3 && '(Stretch)')}
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  width: '100%',
                  height: 1,
                  backgroundColor: '#D9D9D9',
                  borderRadius: 20,
                }}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderAddNewExercise = () => {
    return (
      <View
        style={{
          flex: 1,
          paddingHorizontal: 10,
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        <View>
          <TextInput
            placeholder="Enter exercise name"
            placeholderTextColor={'#76777D'}
            style={{
              width: '100%',
              fontSize: 14,
              paddingVertical: 10,
              backgroundColor: '#E2E2E2',
              borderRadius: 5,
              paddingHorizontal: 10,
              marginBottom: 20,
            }}
            onChangeText={text => {
              setAddNewVal(text);
            }}
            value={addNewVal}
          />
          <Text style={[styles.medSF, {fontSize: 14, paddingBottom: 10}]}>
            Select exercise type
          </Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              marginBottom: 10,
              flexWrap: 'wrap',
            }}>
            {types.map((item, index) => (
              <TouchableOpacity
                onPress={() => {
                  setNewObject({...newObject, type: item.id});
                }}
                key={item.id}
                style={{
                  alignItems: 'center',
                  paddingVertical: 10,
                  marginRight: 10,
                  backgroundColor:
                    newObject.type === item.id ? '#00B0FF' : '#E2E2E2',
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: newObject.type === item.id ? 'white' : '#24262E',
                    fontFamily: 'SFUIText-Regular',
                  }}>
                  {item.type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.medSF, {fontSize: 14, paddingBottom: 10}]}>
            Select bar type
          </Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: 10,
            }}>
            {bar_type.map((item, index) => (
              <TouchableOpacity
                onPress={() => {
                  setNewObject({...newObject, bar_type: item.id});
                }}
                key={item.id}
                style={{
                  alignItems: 'center',
                  paddingVertical: 10,
                  marginRight: 10,
                  backgroundColor:
                    newObject.bar_type === item.id ? '#00B0FF' : '#E2E2E2',
                  borderRadius: 5,
                  marginBottom: 10,
                  paddingHorizontal: 10,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: newObject.bar_type === item.id ? 'white' : '#24262E',
                    fontFamily: 'SFUIText-Regular',
                  }}>
                  {item.type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.medSF, {fontSize: 14, paddingBottom: 10}]}>
            Select muscle group
          </Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: 10,
            }}>
            {muscle.map((item, index) => (
              <TouchableOpacity
                onPress={() => {
                  setNewObject({...newObject, muscle: index});
                }}
                key={index}
                style={{
                  alignItems: 'center',
                  paddingVertical: 10,
                  marginRight: 10,
                  backgroundColor:
                    newObject.muscle === index ? '#00B0FF' : '#E2E2E2',
                  borderRadius: 5,
                  marginBottom: 10,
                  paddingHorizontal: 10,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: newObject.muscle === index ? 'white' : '#24262E',
                    fontFamily: 'SFUIText-Regular',
                  }}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity
          onPress={addExercise}
          style={{
            // flex: 1,
            backgroundColor: '#00B0FF',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 5,
            paddingVertical: 10,
          }}>
          <Text style={[styles.medSF, {fontSize: 14}]}>Add</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        {width: width, height: '100%', position: 'absolute', zIndex: 1},
        animatedOpacity,
      ]}>
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'black',
          opacity: 0.3,
        }}
      />
      <View
        style={[
          {
            position: 'absolute',
            zIndex: 3,
            width: width * 0.85,
            height: height * 0.6,
            backgroundColor: '#24262E',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'white',
            flexDirection: 'column',
            paddingVertical: 10,
            bottom: height / 2 - (height * 0.6) / 2,
            left: width / 2 - (width * 0.85) / 2,
          },
        ]}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            paddingHorizontal: 10,
          }}>
          <TouchableOpacity
            onPress={() => {
              setShowAddNew(!showAddNew);
            }}>
            <Text style={[{fontSize: 16}, styles.blueSFMed]}>
              {showAddNew ? 'Cancel' : 'New'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setClose(true);
            }}>
            <Cross width={14} height={14} color="white" />
          </TouchableOpacity>
        </View>
        {showAddNew === false ? renderExercises() : renderAddNewExercise()}
      </View>
    </Animated.View>
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
    color: '#24262E',
  },
  blueSFMed: {
    fontFamily: 'SFUIText-Medium',
    color: '#00B0FF',
  },
});

export default AddExerciseModal;
