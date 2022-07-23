import { Route, Routes } from "react-router-dom";
import "./App.css";
//import TwitterGraph from "./components/TwitterGraph";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Routes>
      {/* <Route path="/admin" element={<TwitterGraph />} /> */}
      <Route index element={<HomePage />} />
    </Routes>
  );
}

export default App;
