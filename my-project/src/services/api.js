


// import axios from "axios";

// /*
// ==================================================
// API CONFIGURATION
// ==================================================
// */

// const API_BASE_URL =
//   import.meta.env.VITE_API_URL ||
//   "https://nexatech-smartbudget-backend.vercel.app/api";


// /*
// ==================================================
// AXIOS INSTANCE
// ==================================================
// */

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true,
//   timeout: 15000,

//   headers: {
//     "Content-Type": "application/json",
//   },
// });


// /*
// ==================================================
// TOKEN STORAGE
// ==================================================
// */

// const getToken = () => {
//   try {
//     return localStorage.getItem("token");
//   } catch {
//     return null;
//   }
// };


// const setToken = (token) => {
//   if (!token) return;

//   try {
//     localStorage.setItem("token", token);
//   } catch (error) {
//     console.error(
//       "TOKEN_STORAGE_ERROR:",
//       error
//     );
//   }
// };


// const removeToken = () => {
//   try {
//     localStorage.removeItem("token");
//   } catch (error) {
//     console.error(
//       "TOKEN_REMOVE_ERROR:",
//       error
//     );
//   }
// };


// /*
// ==================================================
// REQUEST INTERCEPTOR
// ==================================================
// */

// api.interceptors.request.use(
//   (config) => {
//     const token = getToken();

//     if (token) {
//       config.headers =
//         config.headers || {};

//       config.headers.Authorization =
//         `Bearer ${token}`;
//     }

//     return config;
//   },

//   (error) => {
//     return Promise.reject(error);
//   }
// );


// /*
// ==================================================
// REFRESH TOKEN MANAGEMENT
// ==================================================
// */

// let isRefreshing = false;

// let pendingRequests = [];


// /*
// ==================================================
// PROCESS QUEUED REQUESTS
// ==================================================
// */

// const processQueue = (
//   error,
//   token = null
// ) => {
//   pendingRequests.forEach(
//     ({ resolve, reject }) => {

//       if (error) {
//         reject(error);
//       } else {
//         resolve(token);
//       }

//     }
//   );

//   pendingRequests = [];
// };


// /*
// ==================================================
// RESPONSE INTERCEPTOR
// ==================================================
// */

// api.interceptors.response.use(

//   (response) => {
//     return response;
//   },

//   async (error) => {

//     const originalRequest =
//       error.config;

//     const status =
//       error.response?.status;


//     /*
//     ==============================================
//     NETWORK ERROR
//     ==============================================
//     */

//     if (!error.response) {

//       return Promise.reject({
//         message:
//           "Network error. Please check your connection.",
//       });

//     }


//     /*
//     ==============================================
//     ONLY HANDLE 401
//     ==============================================
//     */

//     if (status !== 401) {

//       if (status === 429) {
//         console.warn(
//           "Too many requests."
//         );
//       }

//       return Promise.reject(error);
//     }


//     /*
//     ==============================================
//     PREVENT INFINITE RETRY
//     ==============================================
//     */

//     if (
//       originalRequest?._retry
//     ) {
//       return Promise.reject(error);
//     }


//     originalRequest._retry = true;


//     /*
//     ==============================================
//     NEVER REFRESH THE REFRESH REQUEST
//     ==============================================
//     */

//     if (
//       originalRequest.url?.includes(
//         "/auth/refresh-token"
//       )
//     ) {

//       removeToken();

//       window.dispatchEvent(
//         new Event("auth:logout")
//       );

//       return Promise.reject(error);
//     }


//     /*
//     ==============================================
//     WAIT FOR EXISTING REFRESH
//     ==============================================
//     */

//     if (isRefreshing) {

//       return new Promise(
//         (resolve, reject) => {

//           pendingRequests.push({
//             resolve,
//             reject,
//           });

//         }
//       ).then((newToken) => {

//         originalRequest.headers =
//           originalRequest.headers || {};

//         originalRequest.headers.Authorization =
//           `Bearer ${newToken}`;

//         return api(originalRequest);

//       });

//     }


//     /*
//     ==============================================
//     START TOKEN REFRESH
//     ==============================================
//     */

//     isRefreshing = true;


//     try {

//       const response =
//         await axios.post(

//           `${API_BASE_URL}/auth/refresh-token`,

//           {},

//           {
//             withCredentials: true,
//             headers: {
//               "Content-Type":
//                 "application/json",
//             },
//           }

//         );


//       /*
//       ============================================
//       EXTRACT NEW ACCESS TOKEN
//       ============================================
//       */

//       const newToken =
//         response.data?.token;


//       if (!newToken) {

//         throw new Error(
//           "Refresh endpoint did not return an access token."
//         );

//       }


//       /*
//       ============================================
//       STORE NEW ACCESS TOKEN
//       ============================================
//       */

//       setToken(newToken);


//       /*
//       ============================================
//       RESOLVE QUEUED REQUESTS
//       ============================================
//       */

//       processQueue(
//         null,
//         newToken
//       );


//       /*
//       ============================================
//       RETRY ORIGINAL REQUEST
//       ============================================
//       */

//       originalRequest.headers =
//         originalRequest.headers || {};

//       originalRequest.headers.Authorization =
//         `Bearer ${newToken}`;


//       return api(
//         originalRequest
//       );


//     } catch (refreshError) {

//       /*
//       ============================================
//       REFRESH FAILED
//       ============================================
//       */

//       processQueue(
//         refreshError,
//         null
//       );

//       removeToken();


//       /*
//       Do not force a hard page reload.
//       Let AuthContext/AuthProvider handle logout.
//       */

//       window.dispatchEvent(
//         new Event("auth:logout")
//       );


//       return Promise.reject(
//         refreshError
//       );


//     } finally {

//       isRefreshing = false;

//     }

//   }

// );


// export default api;






import axios from "axios";

/*
============================================================
API CONFIGURATION
============================================================
*/

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://nexatech-smartbudget-backend.vercel.app/api";

const API_TIMEOUT = 15000;

const REFRESH_ENDPOINT =
  "/auth/refresh-token";

/*
============================================================
AXIOS INSTANCE
============================================================
*/

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

/*
============================================================
TOKEN STORAGE
============================================================
*/

const getToken = () => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

const setToken = (token) => {
  if (!token) {
    return;
  }

  try {
    localStorage.setItem(
      "token",
      token
    );
  } catch {
    /*
     * Storage failure should not crash
     * the application.
     */
  }
};

const removeToken = () => {
  try {
    localStorage.removeItem("token");
  } catch {
    /*
     * Storage failure should not crash
     * the application.
     */
  }
};

/*
============================================================
AUTH LOGOUT EVENT
============================================================
*/

const dispatchAuthLogout = () => {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new Event("auth:logout")
  );
};

/*
============================================================
REFRESH STATE
============================================================
*/

/*
 * A single Promise is used instead of maintaining a manual
 * callback queue.
 *
 * If ten requests receive 401 simultaneously:
 *
 * request 1 -> starts refresh
 * request 2 -> waits for refresh
 * request 3 -> waits for refresh
 * ...
 *
 * Only ONE refresh request is sent.
 */

let refreshPromise = null;

/*
============================================================
REQUEST INTERCEPTOR
============================================================
*/

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    /*
     * Axios may expose headers as undefined depending
     * on the request configuration.
     */
    config.headers =
      config.headers || {};

    /*
     * Do not overwrite an explicitly supplied
     * Authorization header.
     */
    if (
      token &&
      !config.headers.Authorization
    ) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

/*
============================================================
REFRESH ACCESS TOKEN
============================================================
*/

const refreshAccessToken = async () => {
  /*
   * Reuse an existing refresh operation.
   */
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise =
    axios
      .post(
        `${API_BASE_URL}${REFRESH_ENDPOINT}`,
        {},
        {
          withCredentials: true,

          timeout: API_TIMEOUT,

          headers: {
            "Content-Type":
              "application/json",
          },
        }
      )
      .then((response) => {
        const newToken =
          response?.data?.token ||
          response?.data?.accessToken ||
          response?.data?.data?.token ||
          response?.data?.data?.accessToken;

        if (!newToken) {
          throw new Error(
            "Refresh endpoint did not return an access token."
          );
        }

        setToken(newToken);

        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });

  return refreshPromise;
};

/*
============================================================
RESPONSE INTERCEPTOR
============================================================
*/

api.interceptors.response.use(
  (response) =>
    response,

  async (error) => {
    /*
     * Preserve the original Axios error.
     *
     * IMPORTANT:
     *
     * Do NOT convert network errors into:
     *
     * {
     *   message: "Network error..."
     * }
     *
     * because that destroys useful Axios metadata.
     */

    const originalRequest =
      error?.config;

    const status =
      error?.response?.status;

    /*
     * No response means:
     *
     * - network failure
     * - CORS failure
     * - DNS failure
     * - timeout
     * - connection failure
     *
     * Let the SmartSave service normalize this.
     */
    if (!error?.response) {
      return Promise.reject(error);
    }

    /*
     * Only HTTP 401 participates in
     * token-refresh handling.
     */
    if (status !== 401) {
      return Promise.reject(error);
    }

    /*
     * If Axios somehow has no request configuration,
     * there is nothing safe to retry.
     */
    if (!originalRequest) {
      return Promise.reject(error);
    }

    /*
     * Never retry the same request twice.
     */
    if (
      originalRequest._smartBudgetRetry
    ) {
      return Promise.reject(error);
    }

    /*
     * Never refresh in response to the
     * refresh request itself.
     */
    const requestUrl =
      String(
        originalRequest.url || ""
      );

    if (
      requestUrl.includes(
        REFRESH_ENDPOINT
      )
    ) {
      removeToken();

      dispatchAuthLogout();

      return Promise.reject(error);
    }

    originalRequest._smartBudgetRetry =
      true;

    try {
      const newToken =
        await refreshAccessToken();

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newToken}`;

      return api(
        originalRequest
      );
    } catch (refreshError) {
      removeToken();

      dispatchAuthLogout();

      return Promise.reject(
        refreshError
      );
    }
  }
);

/*
============================================================
PUBLIC API
============================================================
*/

export default api;

