import React from "react";
import { useEffect } from "react";
import { v1 as uuid } from "uuid";
import M from "materialize-css";

const DashboardScreen = (props) => {
  const createRoom = () => {
    const id = uuid();
    props.history.push(`/room/${id}`);
  };

  useEffect(() => {
    M.AutoInit(); // Initialize Materialize components
  }, []);

  return (
    <div className="container">
      <div className="card-container">
        <div className="card">
          <button onClick={createRoom}>Create room</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
