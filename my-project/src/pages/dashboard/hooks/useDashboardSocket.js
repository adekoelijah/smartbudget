// import { useEffect, useRef } from "react";
// import { io } from "socket.io-client";

// const SOCKET_URL =
//   import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// let socket = null;

// const getSocket = () => {
//   if (!socket) {
//     socket = io(SOCKET_URL, {
//       transports: ["websocket"],
//       withCredentials: true,
//     });
//   }
//   return socket;
// };

// const useDashboardSocket = (userId, handler) => {
//   const handlerRef = useRef(handler);

//   // always keep latest handler (prevents re-subscription)
//   useEffect(() => {
//     handlerRef.current = handler;
//   }, [handler]);

//   useEffect(() => {
//     if (!userId) return;

//     const s = getSocket();

//     s.emit("join:user", { userId });

//     const emit = (type) => (data) => {
//       handlerRef.current?.({ type, data });
//     };

//     // EVENTS (clean mapping layer)
//     s.on("transaction:created", emit("transaction:created"));
//     s.on("transaction:updated", emit("transaction:updated"));
//     s.on("balance:updated", emit("balance:updated"));
//     s.on("analytics:updated", emit("analytics:updated"));
//     s.on("notification:new", emit("notification:new"));

//     return () => {
//       s.off("transaction:created");
//       s.off("transaction:updated");
//       s.off("balance:updated");
//       s.off("analytics:updated");
//       s.off("notification:new");
//     };
//   }, [userId]);
// };




import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

/*
==================================================
SOCKET CONFIGURATION
==================================================
*/

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";


/*
==================================================
SOCKET INSTANCE
==================================================
*/

let socket = null;


const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,

      withCredentials: true,

      transports: ["websocket", "polling"],

      reconnection: true,

      reconnectionAttempts: 5,

      reconnectionDelay: 1000,

      reconnectionDelayMax: 5000,
    });
  }

  return socket;
};


/*
==================================================
DASHBOARD SOCKET HOOK
==================================================
*/

const useDashboardSocket = (userId, handler) => {
  const handlerRef = useRef(handler);


  /*
  ==================================================
  KEEP LATEST HANDLER
  ==================================================
  */

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);


  /*
  ==================================================
  SOCKET LIFECYCLE
  ==================================================
  */

  useEffect(() => {
    if (!userId) {
      return undefined;
    }


    const s = getSocket();


    /*
    ==================================================
    EVENT HANDLER FACTORY
    ==================================================
    */

    const createHandler = (type) => {
      return (data) => {
        handlerRef.current?.({
          type,
          data,
        });
      };
    };


    /*
    ==================================================
    CREATE STABLE LISTENERS
    ==================================================
    */

    const transactionCreated =
      createHandler("transaction:created");

    const transactionUpdated =
      createHandler("transaction:updated");

    const balanceUpdated =
      createHandler("balance:updated");

    const analyticsUpdated =
      createHandler("analytics:updated");

    const notificationNew =
      createHandler("notification:new");


    /*
    ==================================================
    REGISTER LISTENERS
    ==================================================
    */

    s.on(
      "transaction:created",
      transactionCreated
    );

    s.on(
      "transaction:updated",
      transactionUpdated
    );

    s.on(
      "balance:updated",
      balanceUpdated
    );

    s.on(
      "analytics:updated",
      analyticsUpdated
    );

    s.on(
      "notification:new",
      notificationNew
    );


    /*
    ==================================================
    CONNECT
    ==================================================
    */

    if (!s.connected) {
      s.connect();
    }


    /*
    ==================================================
    JOIN USER ROOM
    ==================================================
    */

    const joinUser = () => {
      s.emit("join:user", {
        userId,
      });
    };


    /*
    ==================================================
    JOIN AFTER CONNECTION
    ==================================================
    */

    if (s.connected) {
      joinUser();
    } else {
      s.once("connect", joinUser);
    }


    /*
    ==================================================
    CLEANUP
    ==================================================
    */

    return () => {
      s.off(
        "transaction:created",
        transactionCreated
      );

      s.off(
        "transaction:updated",
        transactionUpdated
      );

      s.off(
        "balance:updated",
        balanceUpdated
      );

      s.off(
        "analytics:updated",
        analyticsUpdated
      );

      s.off(
        "notification:new",
        notificationNew
      );

      s.off("connect", joinUser);
    };
  }, [userId]);
};


export default useDashboardSocket;