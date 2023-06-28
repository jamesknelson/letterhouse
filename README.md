# Letterhouse

This is the source for the (rather over-engineered) platform I built for my (rather simple) [website](https://jamesknelson.com).

The website itself is an [Astro](https://astro.build/) app. I haven't included the source for it, as my unpublished drafts are just files in the repository. However, I have included a demo site under the `/demo` folder.

With this said, the website repository itself just contains the content. The platform and theme are located in two packages in this repository:

- `/packages/letterhouse` exports an Astro integration which (among other things) turns the `/src/posts` directory into a bunch of pages.
- `/packages/letterhouse-theme-ink` contains the CSS and Markup which actually styles my blog.

## Now draw the rest of the owl.

- I use [obsidian.md](https://obsidian.md/) to edit the markdown files that make up the website's content, along with the [obsidian-git](https://github.com/denolehov/obsidian-git) plugin to push these changes to a private git repository.
- The site is via a [render.com](https://render.com) static site, which is setup to build and deploy whenever I push a new change to the git repository's main branch.

## License

Not that I'd recommend relying on this codebase, as it's a veritable shitshow, but if you insist, the code is available for use under the MIT license.