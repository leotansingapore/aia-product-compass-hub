import type { Components } from "react-markdown";
import { markdownComponents } from "@/lib/markdown-config";
import { MermaidDiagram } from "./MermaidDiagram";

export const dayMarkdownComponents: Components = {
  ...markdownComponents,
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
