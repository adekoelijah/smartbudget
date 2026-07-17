import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    income: "",
    goal: "",
  });

  const handleFinish = () => {
    localStorage.setItem("onboarded", "true");
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md">
        {step === 1 && (
          <>
            <h2>Welcome 👋</h2>
            <input
              placeholder="Your name"
              onChange={(e) =>
                setData({ ...data, name: e.target.value })
              }
            />
            <button onClick={() => setStep(2)}>
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Monthly Income</h2>
            <input
              onChange={(e) =>
                setData({ ...data, income: e.target.value })
              }
            />
            <button onClick={() => setStep(3)}>
              Next
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Savings Goal</h2>
            <input
              onChange={(e) =>
                setData({ ...data, goal: e.target.value })
              }
            />
            <button onClick={handleFinish}>
              Finish
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Onboarding;