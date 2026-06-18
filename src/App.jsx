import { Routes, Route } from "react-router-dom";

import styles from "./App.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import { Home } from "./pages/Home";
import { AllProjects } from "./pages/AllProjects";

function App() {
  return (
    <div className={styles.App}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<AllProjects />} />
      </Routes>
    </div>
  );
}

export default App;
