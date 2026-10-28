# PharmaOneBD releases

Installer builds for the PharmaOneBD Android app. The app checks this repository for updates.

## Website

The repository root hosts the [PharmaOneBD landing page](https://shamimsdp.github.io/PharmaOneBD-releases/) on GitHub Pages. It is a static site with three pages: `index.html` (home, 3D shelf hero, GSAP scroll animation), `features.html` (94 features in 12 modules) and `reports.html` (25 reports). Page content lives in `js/data.js`; shared behavior is in `js/common.js`, `js/home.js`, `js/pages.js` and `js/shelf3d.js`; styles are in `css/site.css`. Pages publishes from the `master` branch root.

The page links to this repository's [Releases](https://github.com/shamimsdp/PharmaOneBD-releases/releases) for app builds. The app gallery uses actual Android screenshots in `assets/screens/`. The clickable shelf map and OCR scan animation are labeled examples. Shelf photo mapping is described as a future concept, as it is in the product spec.
