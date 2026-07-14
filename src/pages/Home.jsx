import { About } from "../components/About/About";
import { Contact } from "../components/Contact/Contact";
import { Experience } from "../components/Experience/Experience";
import { Hero } from "../components/Hero/Hero";
import { NavBar } from "../components/NavBar/NavBar";
import { Projects } from "../components/Projects/Projects";

export const Home = () => {
  return (
    <>
      <NavBar />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Contact />
    </>
  );
};
