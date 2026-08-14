import api from "./api";

const ENDPOINTS = Object.freeze({
  calculate:
    "/savings/emergency-fund/calculate",

  summary:
    "/savings/emergency-fund",

  recommendations:
    "/savings/emergency-fund/recommendations",
});

/**
 * Calculate emergency-fund projection.
 *
 * The API is responsible for validating and calculating
 * the financial result.
 */
export const calculateEmergencyFundRequest =
  async (payload) => {
    const response =
      await api.post(
        ENDPOINTS.calculate,
        payload
      );

    return response.data;
  };

/**
 * Get persisted emergency-fund summary.
 */
export const getEmergencyFundRequest =
  async () => {
    const response =
      await api.get(
        ENDPOINTS.summary
      );

    return response.data;
  };

/**
 * Get emergency-fund recommendations.
 */
export const getEmergencyFundRecommendationsRequest =
  async () => {
    const response =
      await api.get(
        ENDPOINTS.recommendations
      );

    return response.data;
  };

export default {
  calculateEmergencyFundRequest,
  getEmergencyFundRequest,
  getEmergencyFundRecommendationsRequest,
};