// hooks/useApi.js
import { useState, useEffect } from 'react';
import { api } from '../utils/api.js';

const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(!options.lazy);
  const [error, setError] = useState(null);

  const execute = async (executeUrl = url, executeOptions = options) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(executeUrl, executeOptions);
      setData(response);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!options.lazy && url) {
      execute();
    }
  }, [url]);

  return { data, isLoading, error, refetch: execute };
};

export default useApi;
