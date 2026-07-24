import styles from "./About.module.css";
import skills from "../../data/skills.json";

import { getImageUrl } from "../../utils";

export const About = () => {
  return (
    <section className={styles.container} id="about">
      <div className={styles.content}>
        <div className={styles.col}>
          <h2 className={styles.title}>About</h2>
          <div className={`${styles.aboutItems} ${styles.aboutItemText}`}>
            <p>
              Hello! I&apos;m <span className={styles.custom_bold}>Ben Nguyen</span>, a Computer Science graduate at Carnegie Mellon University with a concentration in Security and Privacy. Currently, I work at CACI as a Software Quality Engineer, and am developing an automated testing framework using Playwright. On top of that, I'm also responsible for refactoring legacy interfaces with manufacturing equipment to improve test reliability.
            </p>
            <p> 
              During my time at CMU, I worked as a teaching assistant for the course 15-112: Fundamentals of Programming and Computer Science, and also took on the role as the division lead for review.
            </p>
            <p>
              I&apos;ve interned at FPT Software as an AI Engineer Intern in December 2023, where I learned the fundamentals of machine learning, and worked on projects involving basic data annotation and machine learning models. I returned for another internship from May to August 2024, where I worked on improving an embedding model, and leveraging LLMs to develop various applications.
            </p>
            <p>
              Recently, I&apos;ve taken an interest in game development, and have recreated a few games in my free time. Other than that, I&apos;ve also tried my hand at AI/ML and incorporating them into the games I&apos;ve made.
            </p>
          </div>

          {/* <ul className={styles.aboutItems}>
                    <li className={styles.aboutItem}>
                        <img src={getImageUrl('about/cursorIcon.png')} alt='Cursor Icon'/>
                        <div className={styles.aboutItemText}>
                            <h3>Croaker</h3>
                            <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                            </p>
                        </div>
                    </li>
                    <li className={styles.aboutItem}>
                        <img src={getImageUrl('about/serverIcon.png')} alt='Server Icon'/>
                        <div className={styles.aboutItemText}>
                            <h3>Sobber</h3>
                            <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                            </p>
                        </div>
                    </li>
                    <li className={styles.aboutItem}>
                        <img src={getImageUrl('about/uiIcon.png')} alt='UI Icon'/>
                        <div className={styles.aboutItemText}>
                            <h3>Fired</h3>
                            <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                            </p>
                        </div>
                    </li>
                </ul> */}
        </div>
        <div className={styles.col}>
          <h2 className={styles.title}>Skills</h2>
          <div className={styles.skills}>
            {skills.map((skill, id) => {
              return (
                <div key={id} className={styles.skill}>
                  <div className={styles.skillImageContainer}>
                    <img src={getImageUrl(skill.imageSrc)} alt={skill.title} className={styles.skillImage}/>
                  </div>
                  <p>{skill.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
