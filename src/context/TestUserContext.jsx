// src/context/TestUserContext.jsx
import React, { createContext, useContext, useState } from "react";
import { TEST_USERS } from "../testData/users";

const TestUserContext = createContext(null);

export function TestUserProvider({ children }) {
  const [activeUserId, setActiveUserId] = useState(TEST_USERS[0].id);

  const activeUser = TEST_USERS.find((u) => u.id === activeUserId) ?? TEST_USERS[0];

  const value = {
    users: TEST_USERS,
    activeUser,
    setActiveUserId,
  };

  return (
    <TestUserContext.Provider value={value}>
      {children}
    </TestUserContext.Provider>
  );
}

export function useTestUsers() {
  const ctx = useContext(TestUserContext);
  if (!ctx) {
    throw new Error("useTestUsers must be used within a TestUserProvider");
  }
  return ctx;
}
