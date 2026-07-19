import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { NavBar } from "../components/NavBar/NavBar";
import projects from "../data/projects.json";
import { getImageUrl } from "../utils";
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

  const {
    title,
    date,
    imageSrc,
    description,
    skills,
    demo,
    source,
    longDescription,
    features,
    gallery,
  } = project;

  const paragraphs = longDescription?.length ? longDescription : [description];

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
        {paragraphs.map((paragraph, id) => {
          return (
            <p key={id} className={styles.paragraph}>
              {paragraph}
            </p>
          );
        })}
        {features?.length > 0 && (
          <>
            <h3 className={styles.sectionTitle}>Features</h3>
            <ul className={styles.features}>
              {features.map((feature, id) => {
                return (
                  <li key={id} className={styles.feature}>
                    {feature}
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {gallery?.length > 0 && (
          <>
            <h3 className={styles.sectionTitle}>Gallery</h3>
            <div className={styles.gallery}>
              {gallery.map((image, id) => {
                return (
                  <img
                    key={id}
                    src={getImageUrl(image)}
                    alt={`Screenshot of ${title}`}
                    className={styles.galleryImage}
                  />
                );
              })}
            </div>
          </>
        )}
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
