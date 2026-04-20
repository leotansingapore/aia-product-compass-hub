import type { Components } from "react-markdown";
import { Link } from "react-router-dom";
import { markdownComponents } from "@/lib/markdown-config";
import { MermaidDiagram } from "./MermaidDiagram";

export const dayMarkdownComponents: Components = {
  ...markdownComponents,
  a: ({ children, href, ...rest }: any) => {
    const url = typeof href === "string" ? href : "";
    const isInternal = url.startsWith("/") && !url.startsWith("//");
    if (isInternal) {
      return (
        <Link
          to={url}
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          {...rest}
        >
          {children}
        </Link>
      );
    }
    const Fallback = markdownComponents.a as any;
    return <Fallback href={url} {...rest}>{children}</Fallback>;
  },
  code: ({ className, children, ...rest }: any) => {
    const lang = typeof className === "string" ? className.replace("language-", "") : "";
    if (lang === "mermaid") {
      const code = Array.isArray(children) ? children.join("") : String(children ?? "");
      return <MermaidDiagram code={code.trim()} />;
    }
    const Fallback = markdownComponents.code as any;
    return <Fallback className={className} {...rest}>{children}</Fallback>;
  },
  pre: ({ children, ...rest }: any) => {
    const child: any = Array.isArray(children) ? children[0] : children;
    const lang: string | undefined = child?.props?.className?.replace?.("language-", "");
    if (lang === "mermaid") {
      return <>{children}</>;
    }
    const Fallback = markdownComponents.pre as any;
    return <Fallback {...rest}>{children}</Fallback>;
  },
};
