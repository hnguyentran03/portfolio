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
              Hello! I&apos;m <span className={styles.custom_bold}>Ben Nguyen</span>, a Software Quality Engineer at CACI, where I&apos;m developing an automated testing framework for spectrum monitoring solutions. I&apos;m also responsible for refactoring legacy interfaces to manufacturing equipment to improve test reliability.
            </p>
            <p>
              I graduated from Carnegie Mellon University with a bachelor&apos;s degree in Computer Science and a concentration in Security and Privacy. During my time at CMU, I was a teaching assistant for 15-112: Fundamentals of Programming and Computer Science, where I also served as the review division lead.
            </p>
            <p>
              I interned at FPT Software as an AI Engineer in December 2023, learning the fundamentals of machine learning and working on data annotation and ML model projects. I returned from May to August 2024, where I improved an embedding model and built LLM-powered applications.
            </p>
            <p>
              Recently, I&apos;ve taken an interest in game development and have recreated a few games in my free time. I&apos;ve also been experimenting with incorporating AI/ML into the games I&apos;ve made.
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
