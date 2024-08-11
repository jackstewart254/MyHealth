/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import CreateWorkout from './createWorkout';
import {useWorkoutTracker} from '../../../contexts/workoutTracker';
import {getExercise, getTemplates} from '../../../localStorage/fetch';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

const MainWorkoutTracker = () => {
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();
  const workouts = [
    {
      name: 'Chest + Shoulders',
      exercises: [
        'Pull-ups',
        'Shoulder Press (Barbell)',
        'Bench Press (Barbell)',
        'Hammer Curl (DB)',
        'Shrug Pulls',
      ],
    },
    {
      name: 'Legs',
      exercises: [
        'Pull-ups',
        'Shoulder Press (Barbell)',
        // 'Bench Press (Barbell)',
        // 'Hammer Curl (DB)',
        // 'Shrug Pulls',
      ],
    },
    {
      name: 'Legs',
      exercises: [
        'Pull-ups',
        'Shoulder Press (Barbell)',
        // 'Bench Press (Barbell)',
        // 'Hammer Curl (DB)',
        // 'Shrug Pulls',
      ],
    },
  ];

  useEffect(() => {
    if (workoutTracker.closeSlide === true) {
      const timer = setTimeout(() => {
        setWorkoutTracker({
          ...workoutTracker,
          animateSlide: false,
          closeSlide: false,
        });
      }, 300);
    }
  });

  useEffect(() => {
    getTemplate;
  }, []);

  const getTemplate = async () => {
    const res = await getExercise('templates');
    console.log('awaiting template: ', res);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#24262E',
        flexDirection: 'column',
        paddingHorizontal: 20,
        position: 'relative',
      }}>
      <View style={{height: height * 0.05}} />
      <Text
        style={[
          styles.medSF,
          {
            fontSize: 20,
            paddingTop: 20,
          },
        ]}>
        Start workout
      </Text>
      <Text style={[styles.medSF, {fontSize: 15, paddingTop: 20}]}>
        Quick start
      </Text>
      <View style={{flexDirection: 'row', display: 'flex', paddingTop: 10}}>
        <View
          style={{
            width: '50%',
            height: 40,
            backgroundColor: '#00B0FF',
            borderTopLeftRadius: 100,
            borderBottomLeftRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={[styles.regSF, {fontSize: 14}]}>
            Start empty workout
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setWorkoutTracker({...workoutTracker, animateSlide: true});
          }}
          style={{
            width: '50%',
            height: 40,
            backgroundColor: '#02BC86',
            borderTopRightRadius: 100,
            borderBottomRightRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={[styles.regSF, {fontSize: 14}]}>Create new workout</Text>
        </TouchableOpacity>
      </View>
      <Text style={[{paddingTop: 20, fontSize: 15}, styles.medSF]}>Recent</Text>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          paddingTop: 10,
          // height: '100%',
        }}>
        <View
          style={{
            width: '50%',
            paddingBottom: 10,
            flex: 1,
            flexDirection: 'column',
          }}>
          {workouts.map((item, index) => {
            if (index % 2 === 0) {
              return (
                <View
                  key={index}
                  style={{
                    padding: 10,
                    // flexDirection: 'column',
                    // flex: 1,
                    // height: '100%',
                    borderRadius: 10,
                    borderColor: 'white',
                    borderWidth: 1,
                    marginBottom: 10,
                  }}>
                  <Text style={[styles.medSF, {fontSize: 16}]}>
                    {item.name}
                  </Text>
                  {item.exercises.map((exercise, eIndex) => (
                    <Text
                      style={[styles.regSF, {paddingTop: 5, fontSize: 14}]}
                      key={eIndex}>
                      {exercise}
                    </Text>
                  ))}
                </View>
              );
            }
          })}
        </View>
        <View style={{width: 10}} />
        <View
          style={{
            width: '50%',
            paddingBottom: 10,
            flex: 1,
            flexDirection: 'column',
          }}>
          {workouts.map((item, index) => {
            if (index % 2 > 0) {
              return (
                <View
                  key={index}
                  style={{
                    padding: 10,
                    // flexDirection: 'column',
                    // flex: 1,
                    // height: '100%',
                    borderRadius: 10,
                    borderColor: 'white',
                    borderWidth: 1,
                    marginBottom: 10,
                  }}>
                  <Text style={[styles.medSF, {fontSize: 16}]}>
                    {item.name}
                  </Text>
                  {item.exercises.map((exercise, eIndex) => (
                    <Text
                      style={[styles.regSF, {paddingTop: 5, fontSize: 14}]}
                      key={eIndex}>
                      {exercise}
                    </Text>
                  ))}
                </View>
              );
            }
          })}
        </View>
      </View>
      {workoutTracker.animateSlide === true && (
        <View
          style={{
            width: width,
            height: height,
            backgroundColor: 'black',
            position: 'absolute',
            zIndex: 2,
            opacity: 0.5,
          }}
        />
      )}

      {workoutTracker.animateSlide === true && <CreateWorkout />}
      <CreateWorkout />
    </View>
  );
};

const styles = StyleSheet.create({
  medSF: {
    fontFamily: 'SFUIText-Medium',
    color: 'white',
  },
  regSF: {
    fontFamily: 'SFUIText-Regular',
    color: 'white',
  },
});

export default MainWorkoutTracker;
