# The look — the rules of this folder

- `design-config.json` holds this element's own design tokens (fonts, colours of both themes, type scale, corners, spacing, width); it
  is data the person changes on the Design pages, not code — written as a patch, never overwritten (skill `use-design`).
- The tokens belong to this element alone; another element's approved design comes only as a copy through the core, never a live link.
- Code takes the look only through tokens — never a colour, font or radius written into a widget or a section.
- A saved token redraws every page with no build.
