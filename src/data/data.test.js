// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import projects from "./projects.json";
import history from "./history.json";
import skills from "./skills.json";

const here = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(here, "../../assets");
const contentDir = path.resolve(here, "../content");

// Exact, case-sensitive existence check. The whole path is matched exactly,
// segment by segment: macOS would let "Projects/Foo.PNG" pass fs.existsSync
// while S3 serves a 404.
const assetExists = (relPath) => {
  let dir = assetsDir;
  for (const segment of relPath.split("/")) {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return false;
    if (!fs.readdirSync(dir).includes(segment)) return false;
    dir = path.join(dir, segment);
  }
  return true;
};

const contentSlugs = fs
  .readdirSync(contentDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.slice(0, -".md".length));

describe("projects.json", () => {
  it("has unique, URL-safe slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it.each(projects.map((p) => [p.slug, p]))("%s has the required fields", (_slug, p) => {
    expect(typeof p.title).toBe("string");
    expect(p.title.length).toBeGreaterThan(0);
    expect(typeof p.date).toBe("string");
    expect(typeof p.description).toBe("string");
    expect(Array.isArray(p.skills)).toBe(true);
    expect(p.skills.length).toBeGreaterThan(0);
    expect(typeof p.featured).toBe("boolean");
    for (const link of [p.demo, p.source]) {
      expect(typeof link).toBe("string");
      if (link !== "") expect(link).toMatch(/^https:\/\//);
    }
  });

  it.each(projects.map((p) => [p.slug, p.imageSrc]))("%s image exists in assets/", (_slug, imageSrc) => {
    expect(assetExists(imageSrc), `missing asset ${imageSrc}`).toBe(true);
  });

  it.each(projects.map((p) => [p.slug]))("%s has a content file", (slug) => {
    expect(contentSlugs).toContain(slug);
  });

  it("has no orphaned content files", () => {
    const slugs = projects.map((p) => p.slug);
    for (const slug of contentSlugs) expect(slugs).toContain(slug);
  });

  it("has at least one featured project", () => {
    expect(projects.some((p) => p.featured)).toBe(true);
  });
});

describe("history.json", () => {
  it.each(history.map((h) => [h.organization, h]))("%s is well-formed", (_org, h) => {
    expect(typeof h.role).toBe("string");
    expect(typeof h.location).toBe("string");
    expect(typeof h.startDate).toBe("string");
    expect(typeof h.endDate).toBe("string");
    expect(Array.isArray(h.experiences)).toBe(true);
    expect(h.link).toMatch(/^https:\/\//);
    expect(assetExists(h.imageSrc), `missing asset ${h.imageSrc}`).toBe(true);
  });
});

describe("skills.json", () => {
  it.each(skills.map((s) => [s.title, s]))("%s is well-formed", (_title, s) => {
    expect(typeof s.title).toBe("string");
    expect(assetExists(s.imageSrc), `missing asset ${s.imageSrc}`).toBe(true);
  });

  it("has unique titles", () => {
    const titles = skills.map((s) => s.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("content markdown", () => {
  const mdFiles = contentSlugs.map((slug) => [slug, fs.readFileSync(path.join(contentDir, `${slug}.md`), "utf8")]);

  it.each(mdFiles)("%s only references media that exists", (_slug, md) => {
    const refs = [...md.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1]);
    for (const ref of refs) {
      if (/^https?:\/\//.test(ref)) continue;
      expect(assetExists(ref), `missing asset ${ref}`).toBe(true);
    }
  });

  it.each(mdFiles)("%s does not use a top-level heading", (_slug, md) => {
    // Strip fenced code blocks first: a "# comment" inside a diagram is fine.
    const prose = md.replace(/```[\s\S]*?```/g, "");
    expect(prose).not.toMatch(/^# /m);
  });
});
