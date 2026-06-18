import { useEffect } from "react";
import { Link } from "react-router-dom";

import { NavBar } from "../components/NavBar/NavBar";
import { ProjectGrid } from "../components/Projects/ProjectGrid";
import projects from "../data/projects.json";
import styles from "./AllProjects.module.css";

export const AllProjects = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <NavBar />
      <section className={styles.container} id="projects">
        <h2 className={styles.title}>All Projects</h2>
        <ProjectGrid projects={projects} />
        <Link to="/" className={styles.back}>
          &larr; Back to home
        </Link>
      </section>
    </>
  );
};
