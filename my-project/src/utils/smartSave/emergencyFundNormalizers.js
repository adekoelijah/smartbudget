const firstDefined = (
  ...values
) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

const toNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

export const normalizeEmergencyFund =
  (value) => {
    if (!value) {
      return null;
    }

    const source =
      value?.data ||
      value?.emergencyFund ||
      value;

    return {
      currency:
        firstDefined(
          source.currency
        ) || "NGN",

      monthlyEssentialExpenses:
        toNumber(
          source.monthlyEssentialExpenses
        ),

      currentFund:
        toNumber(
          firstDefined(
            source.currentFund,
            source.currentAmount,
            source.balance
          )
        ),

      targetMonths:
        toNumber(
          source.targetMonths
        ),

      targetAmount:
        toNumber(
          firstDefined(
            source.targetAmount,
            source.target
          )
        ),

      remainingAmount:
        toNumber(
          firstDefined(
            source.remainingAmount,
            source.amountRemaining
          )
        ),

      progressPercentage:
        toNumber(
          firstDefined(
            source.progressPercentage,
            source.progress
          )
        ),

      monthsCovered:
        toNumber(
          source.monthsCovered
        ),

      monthlyContribution:
        toNumber(
          source.monthlyContribution
        ),

      recommendedContribution:
        toNumber(
          source.recommendedContribution
        ),

      targetDateContribution:
        toNumber(
          source.targetDateContribution
        ),

      savingRate:
        toNumber(
          source.savingRate
        ),

      health:
        source.health || "fair",

      healthLabel:
        source.healthLabel || "Fair",

      healthScore:
        toNumber(
          source.healthScore
        ),

      healthMessage:
        source.healthMessage || "",

      status:
        source.status || "building",

      isComplete:
        Boolean(
          source.isComplete
        ),

      projection:
        source.projection || null,

      asOfDate:
        source.asOfDate || null,
    };
  };

export default normalizeEmergencyFund;