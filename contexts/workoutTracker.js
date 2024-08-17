import React, { createContext, useContext, useState } from 'react';

// Create a context with a default value
const WorkoutTracker = createContext();

export const WorkoutTrackerProvider = ({ children }) => {
  const [workoutTracker, setWorkoutTracker] = useState({
    exercise: {id: 0, name: ''},
    animateAddExercise: false,
    animateSlide: false,
    closeSlide: false,
    newWorkout: {},
    slideView: 'create', //edit, active
    currentTemplate: {
      name: '',
      exercises: [],
      sets: [],
      date: '',
      duration: 0,
      id: 0,
      session_num: 0,
    },
    activeSlide: false,
    newExercise: false,
    activeWorkout: false,
    activeWorkoutTemplate: {
      name: '',
      exercises: [],
      sets: [],
      date: '',
      duration: 0,
      id: 0,
      session_num: 0,
    },
    activeWorkoutStartTime: "",
    showWorkoutComplete: false,
    view: 'home',
    close: false,
  });

  return (
    <WorkoutTracker.Provider value={{ workoutTracker, setWorkoutTracker }}>
      {children}
    </WorkoutTracker.Provider>
  );
};

export const useWorkoutTracker = () => useContext(WorkoutTracker);
