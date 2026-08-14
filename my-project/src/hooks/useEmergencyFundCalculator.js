import {
  useCallback,
  useState,
} from "react";

import {
  calculateEmergencyFundRequest,
} from "../services/emergencyFundService";

import {
  normalizeEmergencyFund,
} from "../utils/smartSave/emergencyFundNormalizers";

const useEmergencyFundCalculator =
  () => {
    const [
      result,
      setResult,
    ] = useState(null);

    const [
      loading,
      setLoading,
    ] = useState(false);

    const [
      error,
      setError,
    ] = useState(null);

    const calculate =
      useCallback(
        async (payload) => {
          setLoading(true);
          setError(null);

          try {
            const response =
              await calculateEmergencyFundRequest(
                payload
              );

            const normalized =
              normalizeEmergencyFund(
                response
              );

            setResult(
              normalized
            );

            return normalized;
          } catch (err) {
            const message =
              err?.response?.data
                ?.message ||
              err?.response?.data
                ?.error ||
              err?.message ||
              "Unable to calculate your emergency fund.";

            setError(message);

            throw err;
          } finally {
            setLoading(false);
          }
        },
        []
      );

    const reset =
      useCallback(() => {
        setResult(null);
        setError(null);
      }, []);

    return {
      result,
      loading,
      error,
      calculate,
      reset,
    };
  };

export default useEmergencyFundCalculator;