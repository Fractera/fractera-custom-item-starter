# `widget-dynamic-site-footer`

The footer: the footer pages switch and its links (`APP-CONFIG` `nav.footer`), on the page `/<lang>/admin/site-settings/footer` of this element (node step 579-2). The editor is a copy of the CONFIG
element's one; it reads and writes this element's own settings through the doors of its branch (`/<lang>/admin/api/settings/app` and
`/<lang>/admin/api/settings/platform`), and the pages redraw at once, with no build. While the link to CONFIG is on, the page says so and
links there. The editors live in `../../../_components/site-settings-editors/`; skill `use-site-settings`.
