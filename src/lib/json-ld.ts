/** JSON for a `<script type="application/ld+json">` body, with `<` escaped so no value can end the script early. */
export const jsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
