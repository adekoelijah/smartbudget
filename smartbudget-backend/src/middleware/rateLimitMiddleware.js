

const rateLimitStore = new Map();
const RATE_LIMITS = {

  login: {
    windowMs: 1 * 60 * 1000,
    maxRequests: 20,
  },


  signup: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 10,
  },

  verification: {
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
},

forgotPassword: {
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
},

refreshToken: {
  windowMs: 1 * 60 * 1000,
  maxRequests: 30,
},


  default: {
    windowMs: 1 * 60 * 1000,
    maxRequests: 100,
  },

};


// Remove expired records

const cleanup = () => {

  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {

    if(value.resetTime <= now){

      rateLimitStore.delete(key);

    }

  }

};

const rateLimit = (limitType="default") => {
  return (req,res,next)=>{
    // Allow browser CORS preflight
    if(req.method === "OPTIONS"){
      return next();
    }
    const limit =
      RATE_LIMITS[limitType]
      ||
      RATE_LIMITS.default;
    // const identifier =
    //   req.ip;
    const identifier =
  req.user?.id ||
  req.ip;
    const key =
      `${identifier}:${limitType}`;
    cleanup();
    const existing =
      rateLimitStore.get(key);
    if (!existing) {

  rateLimitStore.set(
    key,
    {
      count: 1,
      resetTime: Date.now() + limit.windowMs,
    }
  );

  res.setHeader(
    "X-RateLimit-Limit",
    limit.maxRequests
  );

  res.setHeader(
    "X-RateLimit-Remaining",
    limit.maxRequests - 1
  );

  return next();

}
    if(existing.count >= limit.maxRequests){


      const retryAfter =
        Math.ceil(
          (existing.resetTime-Date.now())/1000
        );
      res.setHeader(
        "Retry-After",
        retryAfter
      );
      return res.status(429).json({

        success:false,

        message:
          "Too many requests. Please try again later.",

        retryAfter,

      });
    }
    existing.count++;

res.setHeader(
  "X-RateLimit-Limit",
  limit.maxRequests
);

res.setHeader(
  "X-RateLimit-Remaining",
  limit.maxRequests - existing.count
);

next();
  };
};
export default rateLimit;