# Letterhouse-flavored markdown format

Letterhouse extends markdown in the following ways:

- It allows for human-readable "metadata" to be included at the top of the document, terminated with a "------".
- It specifies that links prefixed with a `@` are references to people, and also specifies that a `@` followed by a alphanumeric characters, or underscores reference people, with those people's details being listed in an "address book" file of the same name. In cases where `@` is used to prefix a link, it instructs the software to fetch the person's avatar, name, etc. from the linked URL. These links can be twitter users, nostr pubkeys, etc., and the implementation should automatically cache the results in the address book so that they can be used again without referencing the link.
- It also specifies that the `#` symbol references topics – similar in behavior to the `@` symbol, but without the possibility of associating the topic with a link.
- It allows for [[Wiki-style]] links, simplifying the linking between pages on a single site.
- It allows for embedding of YouTube videos, tweets, Spotify playlist, etc. by prefixing links with `!`.
- It specifies that block quotes can have a final "attribution" line, specifying the author, the source, or both. When there's a signed source, it instructs the software to timestamp and archive the source, so future clients may be able to automatically verify the authenticity of quotes, even if the quoter is not trusted. The software may also use the url/author to display the quote in a style that visually matches the source.

## Metadata

If metadata is present, it can have a combination of two parts:

- Rows listing key-values pairs, known as the "headers"
- Optional title, subtitle, blurb and splash image lines, using `#`, `##`, `>` and `![]()`

## Headers

- The header lines, if present, must come at the beginning of the doc, and start with `~ `. After this prefix, each line begins with a known word like `to`, `from`, `cc`, `re`, `dated`, followed by a value or list of values corresponding to the key. For example:

```
~ from @Me to @[Obama](https://twitter.com/BarackObama) cc @TheReader
~ re #sometopic, ["No one is born hating..."](https://twitter.com/BarackObama/status/896523232098078720)
```

---

Things letterhouse-flavored markdown does NOT do:

- It does not define any way of sealing/signing/timestamping docs. This should be covered by a different format, probably one designed in conjunction with demark, which specifies how to add a seal to the top of the file (which will be ignored by demark), how to name files to indicate replacements, etc. Alternatively, when working with nostr, this can be avoided, as the seal can be added outside of the markdown.