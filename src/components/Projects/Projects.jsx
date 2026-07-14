import { Link } from "react-router-dom";

import styles from "./Projects.module.css";

import projects from "../../data/projects.json";
import { ProjectGrid } from "./ProjectGrid";

export const Projects = () => {
  const featured = projects.filter((project) => project.featured);

  return (
    <section className={styles.container} id="projects">
      <h2 className={styles.title}>Projects</h2>
      <ProjectGrid projects={featured} />
      <Link to="/projects" className={styles.viewAll}>
        View all projects &rarr;
      </Link>
    </section>
  );
};
