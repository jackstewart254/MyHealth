/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Pressable,
} from 'react-native';
import CreateWorkout from './createWorkout';
import {useWorkoutTracker} from '../../../contexts/workoutTracker';
import {getExercise, getTemplates} from '../../../localStorage/fetch';
import {clearKey, clearStorage} from '../../../localStorage/insert';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

const MainWorkoutTracker = () => {
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();
  const [templates, setTemplates] = useState([]);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [templatePopup, setTemplatePopup] = useState({
    name: '',
    exercises: [],
    sets: [],
    date: '',
    duration: 0,
    id: 0,
    session_num: 0,
  });
  const opacity = useSharedValue(0);
  const [closePopup, setClosePopup] = useState(false);

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
    // clearKey('templates');
    getTemplate();
  }, [workoutTracker.animateSlide]);

  useEffect(() => {
    if (workoutTracker.newWorkout.id) {
      setTemplates(prevTemplates => [
        ...prevTemplates,
        workoutTracker.newWorkout,
      ]);
    }
  }, [workoutTracker.newWorkout]);

  useEffect(() => {
    if (templatePopup.id > 0) {
      opacity.value = withTiming(1, {duration: 200});
    }
    if (closePopup === true) {
      opacity.value = withTiming(0, {duration: 200});
      const timer = setTimeout(() => {
        setTemplatePopup({
          name: '',
          exercises: [],
          sets: [],
          date: '',
          duration: 0,
          id: 0,
          session_num: 0,
        });
        setClosePopup(false);
        setShowWorkoutModal(false);
      }, 200);
    }
  }, [templatePopup, closePopup]);

  const animatedOpacity = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handleSetPopupModal = (template: object) => {
    setTemplatePopup(template);
    setShowWorkoutModal(true);
  };

  const getTemplate = async () => {
    const res = await getTemplates('templates');
    setTemplates(res);
  };

  const renderWorkouts = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        handleSetPopupModal(item);
      }}
      style={{
        padding: 10,
        borderRadius: 10,
        borderColor: 'white',
        borderWidth: 1,
        marginBottom: 10,
      }}>
      <Text style={[styles.medSF, {fontSize: 16}]}>{item.name}</Text>
      {item.exercises.map((exercise, eIndex) => (
        <Text
          style={[styles.regSF, {paddingTop: 5, fontSize: 14}]}
          key={eIndex}>
          {exercise.name}
        </Text>
      ))}
    </TouchableOpacity>
  );

  const workoutModal = () => {
    return (
      <Animated.View
        style={[
          {
            width: width,
            height: height,
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          },
          animatedOpacity,
        ]}>
        <Pressable
          onPress={() => {
            setClosePopup(true);
          }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: 'black',
            zIndex: 2,
            opacity: 0.5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
        <View
          style={{
            zIndex: 3,
            flexDirection: 'column',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'white',
            padding: 10,
            backgroundColor: '#24262E',
            width: width * 0.77,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}>
            <Text style={[{fontSize: 16}, styles.medSF]}>
              {templatePopup.name}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setWorkoutTracker({
                  ...workoutTracker,
                  slideView: 'edit',
                  animateSlide: true,
                  currentTemplate: templatePopup,
                });
                setShowWorkoutModal(false);
                setClosePopup(false);
              }}>
              <Text style={[{fontSize: 14}, styles.blueSFMed]}>Edit</Text>
            </TouchableOpacity>
          </View>
          {templatePopup?.exercises?.map((item, index) => {
            const sets = templatePopup.sets.filter(
              set => item.id === set.exercise_id,
            );
            return (
              <View key={index}>
                <Text style={[styles.medSF, {fontSize: 14, paddingBottom: 10}]}>
                  {sets.length + ' x ' + item.name}
                </Text>
              </View>
            );
          })}
          <TouchableOpacity
            style={{
              width: '100%',
              height: 36,
              backgroundColor: '#00B0FF',
              borderRadius: 5,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 10,
            }}>
            <Text style={[styles.medSF, {fontSize: 16}]}>Start workout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
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
      {showWorkoutModal === true && workoutModal()}
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
      <View style={{flexDirection: 'column', display: 'flex', paddingTop: 10}}>
        <TouchableOpacity
          onPress={() => {
            setWorkoutTracker({
              ...workoutTracker,
              slideView: 'active',
              animateSlide: true,
            });
          }}
          style={{
            width: '100%',
            height: 36,
            backgroundColor: '#00B0FF',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
          }}>
          <Text style={[styles.medSF, {fontSize: 14}]}>
            Start empty workout
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setWorkoutTracker({
              ...workoutTracker,
              animateSlide: true,
              slideView: 'create',
            });
          }}
          style={{
            width: '100%',
            height: 36,
            backgroundColor: '#02BC86',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={[styles.medSF, {fontSize: 14}]}>Create new workout</Text>
        </TouchableOpacity>
      </View>
      <Text
        style={[
          {paddingTop: 20, fontSize: 15, marginBottom: 10},
          styles.medSF,
        ]}>
        Workouts
      </Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexDirection: 'row', paddingBottom: 60}}>
        {/* First List */}
        <View style={{width: '50%', paddingRight: 5}}>
          <FlatList
            data={templates.filter((_, index) => index % 2 === 0)}
            renderItem={renderWorkouts}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false} // Disable individual scrolling
          />
        </View>

        {/* Second List */}
        <View style={{width: '50%', paddingLeft: 5}}>
          <FlatList
            data={templates.filter((_, index) => index % 2 > 0)}
            renderItem={renderWorkouts}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false} // Disable individual scrolling
          />
        </View>
      </ScrollView>

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
  blueSFMed: {
    fontFamily: 'SFUIText-Medium',
    color: '#00B0FF',
  },
});

export default MainWorkoutTracker;
