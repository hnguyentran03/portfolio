import styles from "./Experience.module.css";
import history from "../../data/history.json";
import { getImageUrl } from "../../utils";

export const Experience = () => {
  return (
    <section className={styles.container} id="experience">
      <h2 className={styles.title}>Experience</h2>
      <div className={styles.content}>
        {/* <img src={getImageUrl('history/experienceImage.png')} alt='Experience Image' className={styles.experienceImage}/> */}
        <ul className={styles.history}>
          {history.map((historyItem, id) => {
            return (
              <a
                key={id}
                className={styles.historyItemContainer}
                href={historyItem.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <li className={styles.historyItem}>
                  <img
                    src={getImageUrl(historyItem.imageSrc)}
                    alt={`${historyItem.organization} logo`}
                  />
                  <div className={styles.historyItemDetails}>
                    <h3>{`${historyItem.role}, ${historyItem.organization}`}</h3>
                    <p>
                      {historyItem.location}
                      <span className={styles.separator}>·</span>
                      {`${historyItem.startDate}-${historyItem.endDate}`}
                    </p>
                    <ul className={styles.historyItemList}>
                      {historyItem.experiences.map((experience, id) => {
                        return <li key={id}>{experience}</li>;
                      })}
                    </ul>
                  </div>
                </li>
              </a>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
