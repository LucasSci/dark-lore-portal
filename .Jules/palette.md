## 2025-04-07 - Accessible Search Inputs and File Uploads
**Learning:** When using `<Input>` components for search or native `<input type="file">` without an explicit visible `<label>`, screen readers may not announce their purpose correctly, even if there is a `placeholder`. Icons used for decoration inside inputs should be marked with `aria-hidden="true"`.
**Action:** Always provide an `aria-label` to `<Input>` fields (like search bars) and native `<input>` elements that lack a visual `<label>`. Hide purely decorative icons from screen readers using `aria-hidden="true"`.
