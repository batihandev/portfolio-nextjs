import { pageInfo } from "@/data";

const ContactEmail = () => {
  return (
    <a className="break-all text-accent underline underline-offset-4" href={`mailto:${pageInfo.email}`}>
      {pageInfo.email}
    </a>
  );
};

export default ContactEmail;
