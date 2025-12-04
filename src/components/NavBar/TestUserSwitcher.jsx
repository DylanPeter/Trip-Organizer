// e.g. src/components/TestUserSwitcher.jsx
import React from "react";
import { useTestUsers } from "../../context/TestUserContext";

export default function TestUserSwitcher() {
  const { users, activeUser, setActiveUserId } = useTestUsers();

  return (
    <div className="test-user-switcher">
      <label style={{ marginRight: "0.5rem" }}>Active test user:</label>
      <select
        value={activeUser.id}
        onChange={(e) => setActiveUserId(e.target.value)}
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}
