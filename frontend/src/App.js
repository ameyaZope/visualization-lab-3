import { Route, Routes } from "react-router-dom";
import './App.css';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Routes>
      <Route
        exact path="/"
        element={<HomePage />}
      />
    </Routes>
  );
}

export default App;
