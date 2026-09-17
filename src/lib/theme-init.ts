export const THEME_STORAGE_KEY = "theme";

// Inlined in the root layout so the stored or system theme applies before first paint.
export const themeInitScript = `(()=>{try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}})()`;
