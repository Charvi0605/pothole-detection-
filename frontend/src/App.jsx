import { useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  const connectToBackend = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/");
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Could not connect to backend");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>AI Pothole Detection</h1>

      <button onClick={connectToBackend}>
        Connect to Backend
      </button>

      <p>{message}</p>
    </div>
  );
}

export default App;