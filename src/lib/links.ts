export const isExternal = (href: string) => /^https?:\/\//.test(href);

/** Attributes that open an external link in a new tab; empty for internal links. */
export const externalLinkProps = (href: string) => (isExternal(href) ? { target: "_blank", rel: "noreferrer" } : {});
