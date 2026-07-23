import React from "react";
import { useNavigate } from "react-router-dom";

import styles from "./ProjectCard.module.css";
import { getImageUrl } from "../../utils";

export const ProjectCard = ({
  project: { slug, title, date, imageSrc, description, skills },
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.container}
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/projects/${slug}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          navigate(`/projects/${slug}`);
        }
      }}
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
    </div>
  );
};
