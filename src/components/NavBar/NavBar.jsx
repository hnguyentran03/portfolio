import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

import styles from "./NavBar.module.css";
import { getImageUrl } from "../../utils";

export const NavBar = () => {
  return (
    <Navbar expand="lg" className={styles.navbarSticky}>
      <Container>
        <Navbar.Brand as={Link} to="/" className={styles.navbarBrand}>
          <img
            src={getImageUrl("hero/heroImage.png")}
            alt="Home"
            className={styles.navbarBrandImg}
          />
        </Navbar.Brand>
        <Navbar.Toggle className={styles.navbarToggler} aria-controls="basic-navbar-nav">
          <span className={styles.navbarTogglerIcon}></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/#about" className={styles.navbarLink}>
              About
            </Nav.Link>
            <Nav.Link href="/#experience" className={styles.navbarLink}>
              Experience
            </Nav.Link>
            <Nav.Link href="/#projects" className={styles.navbarLink}>
              Projects
            </Nav.Link>
            <Nav.Link href="/#contact" className={styles.navbarLink}>
              Contact
            </Nav.Link>
          </Nav>
          <span className={styles.navbarText}>
            <div className={styles.socialIcon}>
              <a
                href="https://www.linkedin.com/in/hnguyentran03/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={getImageUrl("contact/linkedinIcon.png")}
                  alt="Linkedin"
                />
              </a>
              <a
                href="https://github.com/hnguyentran03"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={getImageUrl("contact/githubIcon.png")} alt="Github" />
              </a>
            </div>
            <a
              href="/ben_nguyen_resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="vvd">
                <span>Resume</span>
              </button>
            </a>
          </span>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
