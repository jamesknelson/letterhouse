TODO

- replies
  * start by including all the necessary information for each url in a hardcoded cache
  * how do we replace the "re: URL" header in a blockquote with text?
  * users can have multiple handles on different services. they have a single id within
    the filesystem db, but we should be able to search for them by other handles so that
    we can extract their address book entry from e.g. a twitter/youtube/website url

- rss: https://docs.astro.build/en/guides/rss/

- find where fonts are stored after build, and fix the <link rel="preload"> tags

- add a Widget model and getWidget io function that loads content from a "widgets" directory,
  with frontmatter and a "Body" property.
  then add a <Widget> component to the theme which automatically loads the named component,
  or for special widgets like "LetterActions", defaults to the one in the theme
- update "inbox" margin with a a widget that explains that I sometimes publish emails I receive

- implement Address Book page, and styled contact pages

- replace "block" classes with raw styles using variables
