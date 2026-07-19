import React from "react";
import { useNavigate } from "react-router-dom";

import styles from "./ProjectCard.module.css";
import { getImageUrl } from "../../utils";

export const ProjectCard = ({
  project: { slug, title, date, imageSrc, description, skills, demo, source },
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.container}
      onClick={() => navigate(`/projects/${slug}`)}
    >
      <img
        src={getImageUrl(imageSrc)}
        alt={`Image of ${title}`}
        className={styles.image}
      />

      <h3 className={styles.title}>{title}</h3>
      <h4 className={styles.date}>{date}</h4>
      <p className={styles.description}>{description}</p>
      <ul className={styles.skills}>
        {skills.map((skill, id) => {
          return (
            <li key={id} className={styles.skill}>
              {skill}
            </li>
          );
        })}
      </ul>
      <div className={styles.links}>
        {source && (
          <a
            className={styles.sourceLink}
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => e.stopPropagation()}
          >
            Demo
          </a>
        )}
      </div>
    </div>
  );
};
