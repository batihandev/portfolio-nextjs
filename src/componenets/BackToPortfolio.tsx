import Link from "next/link";
import { pageInfo } from "@/data";

// Players reach the game privacy pages straight from the game, with no other way into the site.
const BackToPortfolio = () => {
  return (
    <Link
      href="/"
      className="inline-block text-sm text-gray-400 no-underline transition-colors hover:text-accent"
    >
      ← {pageInfo.name}
    </Link>
  );
};

export default BackToPortfolio;
