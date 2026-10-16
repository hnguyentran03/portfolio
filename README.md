# Website Portfolio

My website portfolio created using React + Vite from following the tutorial below:
https://www.youtube.com/watch?v=YQCDUJ6hhNY

I made changes to the formatting of the about, skills and expereince section to be more in line with what I thought would look good.

Navbar and Contacts have inspirations from:

https://www.youtube.com/watch?v=hYv6BM2fWd8&list=PLd0qRSEDFQI7DgB5BKHQrryFlR02n1bK-

## Testing

```bash
npm test            # unit tests (Vitest)
npm run test:e2e    # end-to-end tests (Playwright, builds and serves the site first)
```

`npm run test:e2e:prod` runs only the `@smoke` specs against the live site and skips the contact form. The e2e runner builds into a scratch `.e2e-build` directory and leaves the tracked `build/` alone.

GitHub Actions runs lint, the unit tests, and the e2e suite on every pull request and on pushes to `main` (`.github/workflows/test.yml`). A failed e2e run uploads the Playwright HTML report as a workflow artifact.
