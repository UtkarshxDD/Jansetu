import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../ApiUri';

interface ButtonExperiment {
  buttonText: string;
  isEnabled: boolean;
  variables: Record<string, any>;
  experimentKey: string;
}

export const useButtonExperiment = (userId?: string) => {
  const [experiment, setExperiment] = useState<ButtonExperiment>({
    buttonText: 'Report an issue',
    isEnabled: false,
    variables: {},
    experimentKey: 'kaustubhJanSetu'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiment = async () => {
      try {
        const response = await axios.get(`${API}/experiment/button/${userId || 'anonymous'}`);
        setExperiment(response.data);
      } catch (error) {
        console.error('Failed to fetch button experiment:', error);
        // Keep default values
      } finally {
        setLoading(false);
      }
    };

    fetchExperiment();
  }, [userId]);

  const trackClick = async () => {
    try {
      await axios.post(`${API}/experiment/track-click/${userId || 'anonymous'}`, {
        buttonText: experiment.buttonText
      });
    } catch (error) {
      console.error('Failed to track button click:', error);
    }
  };

  return {
    experiment,
    loading,
    trackClick
  };
};
