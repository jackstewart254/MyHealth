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

  useEffect(() => {
    if (workoutTracker.animateAddExercise === true) {
      opacity.value = withTiming(1, {duration: 200});
    }
  }, [workoutTracker.animateAddExercise]);

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

  const handleGetExercise = async () => {
    const res = await getExercise('exercise');
    for (let i = 0; i < res.length; i++) {
      console.log(res[i].id, res[i].name);
    }
    setExercises(res);
  };

  const setValue = (text: string) => {
    setAddNewVal(text);
  };

  const handleAddExercise = ({exercise}: {exercise: object}) => {
    console.log(exercise);
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
    if (addNewVal.length > 0) {
      const id = generateRandomID();
      const obj = {id: id, name: addNewVal};
      await storeExercise('exercise', obj);
      setWorkoutTracker({...workoutTracker, newExercise: true});
    }
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          zIndex: 3,
          width: width * 0.85,
          height: height * 0.44,
          backgroundColor: '#24262E',
          borderRadius: 10,
          borderWidth: 1,
          borderColor: 'white',
          flexDirection: 'column',
          paddingVertical: 10,
          bottom: height / 2 - (height * 0.44) / 2,
          // top: (height * 0.44) / 2,
          // bottom: height / 4,
          left: width / 2 - (width * 0.85) / 2,
        },
        animatedOpacity,
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
              style={[
                styles.medSF,
                {fontSize: 14, padding: 10, width: '81.1%'},
              ]}
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
            style={[
              {
                paddingVertical: 10,
                paddingHorizontal: 10,
                color: 'white',
                width: '100%',
                backgroundColor: '#353535',
                borderRadius: 5,
                fontSize: 14,
                marginBottom: 20,
              },
              styles.medSF,
            ]}
            placeholder="Search"
            placeholderTextColor={'#7D7D7D'}
            value={exerciseVal}
            onChangeText={text => {
              setExerciseVal(text);
            }}
          />
        )}
      </View>

      {/* <Text
        style={[
          styles.medSF,
          {fontSize: 14, paddingLeft: 10, paddingBottom: 10},
        ]}>
        Recent
      </Text> */}
      <View
        style={{
          width: '100%',
          height: 1,
          backgroundColor: '#D9D9D9',
        }}
      />
      <ScrollView style={{flexDirection: 'column', paddingHorizontal: 10}}>
        {exercises?.map((item, index) => (
          <TouchableOpacity
            onPress={() => {
              handleAddExercise({exercise: {id: item.id, name: item.name}});
            }}
            key={index}
            style={{
              alignItems: 'flex-start',
              justifyContent: 'center',
              // paddingVertical: 10,
            }}>
            <Text
              style={[
                {
                  fontSize: 14,
                  lineHeight: 14,
                  paddingVertical: 14,
                },
                styles.medSF,
              ]}>
              {item.name}
            </Text>
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: '#D9D9D9',
                borderRadius: 20,
              }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    color: 'white',
  },
  blueSFMed: {
    fontFamily: 'SFUIText-Medium',
    color: '#00B0FF',
  },
});

export default AddExerciseModal;
