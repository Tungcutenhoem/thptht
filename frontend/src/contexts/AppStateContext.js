import React, { createContext, useContext, useReducer } from 'react';

const initialState = {
  inputType: 'image', // 'image', 'video', or 'webcam'
  currentFile: null,
  currentFrame: null,
  classificationResult: null,
  isProcessing: false,
  error: null,
};

const AppStateContext = createContext();

const validateInputType = (type) => {
  const validTypes = ['image', 'video', 'webcam'];
  if (!validTypes.includes(type)) {
    console.error('Invalid input type:', type);
    return false;
  }
  return true;
};

const appStateReducer = (state, action) => {
  switch (action.type) {
    case 'SET_INPUT_TYPE':
      if (!validateInputType(action.payload)) {
        return state;
      }
      return { ...state, inputType: action.payload };

    case 'SET_CURRENT_FILE':
      return { ...state, currentFile: action.payload };

    case 'SET_CURRENT_FRAME':
      return { ...state, currentFrame: action.payload };

    case 'SET_CLASSIFICATION_RESULT':
      return {
        ...state,
        classificationResult: action.payload,
        isProcessing: false,
        error: null
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
        error: action.payload ? null : state.error
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isProcessing: false
      };
    case 'CLEAR_RESULT':
      return {
        ...state,
        classificationResult: null,
        isProcessing: false,
        error: null,
      };


    case 'RESET_STATE':
      return initialState;

    default:
      console.warn('Unknown action type:', action.type);
      return state;
  }
};

export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

export default AppStateContext; 