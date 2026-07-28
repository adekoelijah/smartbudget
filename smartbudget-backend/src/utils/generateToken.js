// import jwt from "jsonwebtoken";

// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
// };

// export default generateToken;


// import jwt from "jsonwebtoken";

// const generateToken = (id) => {

//   return jwt.sign(
//     {
//       id,
//       type:"access",
//     },
//     process.env.JWT_SECRET,
//     {
//       expiresIn:
//         process.env.JWT_EXPIRE || "15m",
//     }
//   );

// };

// export default generateToken;


import jwt from "jsonwebtoken";

const generateToken = (
  userId,
  sessionId
) => {

  return jwt.sign(
    {
      id: userId,
      sessionId,
      type: "access",
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRE || "15m",
    }
  );

};

export default generateToken;