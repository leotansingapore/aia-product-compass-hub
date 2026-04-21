import type { Components } from "react-markdown";
import { Link } from "react-router-dom";
import { dayMarkdownComponents } from "./dayMarkdownComponents";

const DAY_HREF_RE = /(?:\.\.\/)*first-60-days\/week-\d+\/day-(\d+)\.md/;

export const assignmentMarkdownComponents: Components = {
  ...dayMarkdownComponents,
  a: ({ children, href, ...rest }: any) => {
    const url = typeof href === "string" ? href : "";
    const dayMatch = url.match(DAY_HREF_RE);
    if (dayMatch) {
      const dayNumber = Number(dayMatch[1]);
      return (
        <Link
          to={`/learning-track/first-60-days/day/${dayNumber}`}
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          {...rest}
        >
          {children}
        </Link>
      );
    }
    const Fallback = (dayMarkdownComponents as any).a;
    return <Fallback href={url} {...rest}>{children}</Fallback>;
  },
};
