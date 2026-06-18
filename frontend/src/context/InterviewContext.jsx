import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axiosInstance';

const InterviewContext = createContext();

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) throw new Error('useInterview must be used within InterviewProvider');
  return context;
};

export const InterviewProvider = ({ children }) => {
  const [interviews, setInterviews] = useState([]);
  const [currentInterview, setCurrentInterview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createInterview = useCallback(async (formData) => {
    setIsAnalyzing(true);
    try {
      const { data } = await api.post('/interviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setInterviews((prev) => [data.data, ...prev]);
      return data.data;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const fetchInterviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/interviews');
      setInterviews(data.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInterviewById = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/interviews/${id}`);
      setCurrentInterview(data.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteInterview = useCallback(async (id) => {
    await api.delete(`/interviews/${id}`);
    setInterviews((prev) => prev.filter((i) => i._id !== id));
  }, []);

  return (
    <InterviewContext.Provider value={{ interviews, currentInterview, isAnalyzing, isLoading, createInterview, fetchInterviews, fetchInterviewById, deleteInterview }}>
      {children}
    </InterviewContext.Provider>
  );
};
