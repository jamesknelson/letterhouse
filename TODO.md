TODO

- implement getReference so that it fetches from/to/date/title from urls and caches the results,
  alongside the cached contents, headers, and time of fetch
- If only a "href: " field is specified, we can try and automatically
  pull in from/to/date/title - either via http, or by looking for a matching href in the letter's
  re: block.
- If from: to: date: title: are specified, they'll be used as the defaults for any
  matching re: href.

- for briefs of letters w/ no blurb, automatically generate some snippet that can be used instead
- export a HTML version of the blurb, alongside the current text version
- add a test letter with no title/blurb, and check that the brief just shows the chunk of the letter.

- the "to-x" and "from-y" in letter directory names should be optional
- If "to-enclosed" is used for the letter id, error if there's no to listed,
  and no default to added by a blockquote or a re:

- implement revisions
  * if you add a revise: frontmatter pointing to one of your own urls, the previous url (and any earlier revisions of it) will get a banner linking to the new version, and will be taken out of the index, and will have their URL point to the new version. the new version will get two dates: "initial" and "revised"
  * the previous version will get a new URL, which will be linked from the revised version
  * we use "revise: " instead of "re: ", as you may want to reference yourself in quotes without
    causing that article to replace the previous one.

- list published replies to a letter, w/ blurbs, underneath the letter
- show a label right of "Reply" with the number of published replies

- rss: https://docs.astro.build/en/guides/rss/

- create "defineSite" function

- find where fonts are stored after build, and fix the <link rel="preload"> tags

- add a Widget model and getWidget io function that loads content from a "widgets" directory,
  with frontmatter and a "Body" property.
  then add a <Widget> component to the theme which automatically loads the named component,
  or for special widgets like "LetterActions", defaults to the one in the theme
- update "inbox" margin with a a widget that explains that I sometimes publish emails I receive

- implement Address Book page, and styled contact pages

- replace "block" classes with raw styles using variables

- remove title, blurb, and quoted text from word count