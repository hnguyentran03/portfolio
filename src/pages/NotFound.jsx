import { useEffect } from "react";
import { Link } from "react-router-dom";

import { NavBar } from "../components/NavBar/NavBar";
import styles from "./NotFound.module.css";

export const NotFound = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <NavBar />
      <section className={styles.container}>
        <p className={styles.code}>404</p>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.description}>
          That page doesn&apos;t exist, or it may have moved somewhere else.
        </p>
        <Link to="/" className={styles.back}>
          &larr; Back to home
        </Link>
      </section>
    </>
  );
};
