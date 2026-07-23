import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { getImageUrl } from "../utils";
import styles from "./ProjectPage.module.css";

// Content files live at src/content/<slug>.md (slug = "slug" field in projects.json).
// Conventions: headings start at ##; image/video paths are relative to the top-level
// assets/ dir (e.g. "projects/foo.png") and resolved via getImageUrl; ![](clip.mp4)
// or ![](clip.webm) renders a <video>; paste YouTube's <iframe> embed snippet for
// YouTube videos; absolute http(s) URLs pass through untouched.

const contentFiles = import.meta.glob("../content/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const contentBySlug = Object.fromEntries(
  Object.entries(contentFiles).map(([path, content]) => [
    path.slice("../content/".length, -".md".length),
    content,
  ])
);

const resolveSrc = (src = "") =>
  /^https?:\/\//.test(src) ? src : getImageUrl(src);

const Media = ({ src = "", alt = "" }) => {
  const url = resolveSrc(src);
  if (/\.(mp4|webm)$/i.test(src)) {
    return <video className={styles.media} src={url} controls playsInline />;
  }
  return <img className={styles.media} src={url} alt={alt} />;
};

// eslint-disable-next-line no-unused-vars
const Embed = ({ node: _node, ...props }) => (
  <div className={styles.embed}>
    <iframe {...props} />
  </div>
);

export const ProjectContent = ({ slug, fallback }) => {
  const content = contentBySlug[slug];

  if (!content) {
    return <p className={styles.paragraph}>{fallback}</p>;
  }

  return (
    <div className={styles.markdown}>
      <Markdown
        rehypePlugins={[rehypeRaw]}
        components={{ img: Media, iframe: Embed }}
      >
        {content}
      </Markdown>
    </div>
  );
};
