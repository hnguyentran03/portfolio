import { useState, useRef } from "react";

import { Row, Col, Container } from "react-bootstrap";
import emailjs from "@emailjs/browser";

import styles from "./Contact.module.css";
import { getImageUrl } from "../../utils";

export const Contact = () => {
  const [buttonText, setButtonText] = useState("Send");
  const [status, setStatus] = useState({});
  const form = useRef();

  const sendEmail = (event) => {
    event.preventDefault();
    setButtonText("Sending...");

    emailjs
      .sendForm("service_2z5tgpg", "template_cbyifdk", form.current, {
        publicKey: "EXcMNC3QWevzm-VIU",
      })
      .then(
        () => {
          setButtonText("Send");
          setStatus({ success: true, message: "Message sent successfully!" });
        },
        () => {
          setButtonText("Send");
          setStatus({
            success: false,
            message: "Something went wrong, please try again later.",
          });
        }
      );
  };

  return (
    <section id="contact" className={styles.contact}>
      <Container>
        <Row className={styles.contactRow}>
          <Col md={6}>
            <img src={getImageUrl("contact/contactImage.png")} alt="Contact" className={styles.contactImg}/>
          </Col>
          <Col md={6}>
            <h2 className={styles.contactText}>Email Me</h2>
            <form onSubmit={sendEmail} ref={form}>
              <Row>
                <Col sm={6} className={styles.contactFormCol}>
                  <input
                    className={styles.contactFormInput}
                    type="text"
                    placeholder="First Name"
                    name="first_name"
                  />
                </Col>
                <Col sm={6} className={styles.contactFormCol}>
                  <input
                    className={styles.contactFormInput}
                    type="text"
                    placeholder="Last Name"
                    name="last_name"
                  />
                </Col>
                <Col sm={12} className={styles.contactFormCol}>
                  <input
                    className={styles.contactFormInput}
                    type="email"
                    placeholder="Email Address"
                    name="user_email"
                  />
                </Col>
                <Col sm={12} className={styles.contactFormCol}>
                  <input
                    className={styles.contactFormInput}
                    type="text"
                    placeholder="Subject"
                    name="subject"
                  />
                </Col>
                <Col sm={12} className={styles.contactFormCol}>
                  <textarea
                    className={styles.contactFormTextArea}
                    rows="6"
                    placeholder="Message"
                    name="message"
                  />
                </Col>
                <Col className={styles.contactFormBtnCol}>
                  <button className={styles.contactFormBtn} type="submit">
                    <span className={styles.contactFormBtnText}>
                      {buttonText}
                    </span>
                  </button>
                  {status.message && (
                    <p
                      className={`${styles.status} ${
                        status.success === false
                          ? styles.danger
                          : styles.success
                      }`}
                    >
                      {status.message}
                    </p>
                  )}
                </Col>
              </Row>
            </form>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
