import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { NavBar } from "../components/NavBar/NavBar";
import projects from "../data/projects.json";
import { getImageUrl } from "../utils";
import { ProjectContent } from "./ProjectContent";
import styles from "./ProjectPage.module.css";

export const ProjectPage = () => {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const { title, date, imageSrc, description, skills, demo, source } = project;

  return (
    <>
      <NavBar />
      <section className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <h3 className={styles.date}>{date}</h3>
        <ul className={styles.skills}>
          {skills.map((skill, id) => {
            return (
              <li key={id} className={styles.skill}>
                {skill}
              </li>
            );
          })}
        </ul>
        <img
          src={getImageUrl(imageSrc)}
          alt={`Image of ${title}`}
          className={styles.heroImage}
        />
        <ProjectContent slug={slug} fallback={description} />
        <div className={styles.links}>
          {source && (
            <a
              className={styles.sourceLink}
              href={source}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source
            </a>
          )}
          {demo && (
            <a
              className={styles.demoLink}
              href={demo}
              target="_blank"
              rel="noopener noreferrer"
            >
              Demo
            </a>
          )}
        </div>
        <Link to="/projects" className={styles.back}>
          &larr; Back to projects
        </Link>
      </section>
    </>
  );
};
