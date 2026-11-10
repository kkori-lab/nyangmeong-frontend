import { createContext, useContext } from 'react';

export const AiModalContext = createContext(null);

export const useAiModal = () => useContext(AiModalContext);
