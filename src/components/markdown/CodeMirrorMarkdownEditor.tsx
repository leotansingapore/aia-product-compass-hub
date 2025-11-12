import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxHighlighting, defaultHighlightStyle, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

interface CodeMirrorMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CodeMirrorMarkdownEditor({ 
  value, 
  onChange, 
  placeholder = 'Write your content using markdown...' 
}: CodeMirrorMarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Custom syntax highlighting with Tailwind-compatible colors
    const customHighlightStyle = HighlightStyle.define([
      { tag: tags.heading1, class: 'cm-heading1' },
      { tag: tags.heading2, class: 'cm-heading2' },
      { tag: tags.heading3, class: 'cm-heading3' },
      { tag: tags.heading4, class: 'cm-heading4' },
      { tag: tags.strong, class: 'cm-strong' },
      { tag: tags.emphasis, class: 'cm-emphasis' },
      { tag: tags.link, class: 'cm-link' },
      { tag: tags.monospace, class: 'cm-code' },
      { tag: tags.quote, class: 'cm-quote' },
      { tag: tags.list, class: 'cm-list' },
    ]);

    const startState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        markdown({ base: markdownLanguage }),
        syntaxHighlighting(customHighlightStyle),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
            backgroundColor: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
          },
          '.cm-content': {
            padding: '16px',
            minHeight: '400px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          },
          '.cm-line': {
            padding: '2px 0',
          },
          '&.cm-focused': {
            outline: 'none',
          },
          '.cm-activeLine': {
            backgroundColor: 'hsl(var(--muted) / 0.3)',
          },
          '.cm-activeLineGutter': {
            backgroundColor: 'hsl(var(--muted) / 0.3)',
          },
          '.cm-gutters': {
            backgroundColor: 'hsl(var(--muted) / 0.2)',
            color: 'hsl(var(--muted-foreground))',
            border: 'none',
          },
          '.cm-lineNumbers .cm-gutterElement': {
            padding: '0 8px',
            minWidth: '40px',
          },
          // Markdown syntax styling
          '.cm-heading1': {
            fontSize: '2em',
            fontWeight: '700',
            color: 'hsl(var(--foreground))',
            lineHeight: '1.2',
          },
          '.cm-heading2': {
            fontSize: '1.5em',
            fontWeight: '700',
            color: 'hsl(var(--foreground))',
            lineHeight: '1.3',
          },
          '.cm-heading3': {
            fontSize: '1.25em',
            fontWeight: '600',
            color: 'hsl(var(--foreground))',
            lineHeight: '1.4',
          },
          '.cm-heading4': {
            fontSize: '1.1em',
            fontWeight: '600',
            color: 'hsl(var(--foreground))',
            lineHeight: '1.4',
          },
          '.cm-strong': {
            fontWeight: '700',
            color: 'hsl(var(--foreground))',
          },
          '.cm-emphasis': {
            fontStyle: 'italic',
            color: 'hsl(var(--foreground))',
          },
          '.cm-link': {
            color: 'hsl(var(--primary))',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          },
          '.cm-code': {
            backgroundColor: 'hsl(var(--muted))',
            padding: '2px 4px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9em',
          },
          '.cm-quote': {
            color: 'hsl(var(--muted-foreground))',
            fontStyle: 'italic',
            borderLeft: '3px solid hsl(var(--border))',
            paddingLeft: '12px',
          },
          '.cm-list': {
            color: 'hsl(var(--primary))',
          },
        }),
        EditorView.editorAttributes.of({
          'data-placeholder': placeholder,
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Only initialize once

  // Handle external value changes
  useEffect(() => {
    if (viewRef.current) {
      const currentValue = viewRef.current.state.doc.toString();
      if (value !== currentValue) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }
  }, [value]);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Editor Container */}
      <div 
        ref={editorRef} 
        className="min-h-[400px] w-full"
        style={{ height: '500px' }}
      />

      {/* Shortcuts Info */}
      <div className="border-t border-border bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
        <span>Markdown shortcuts: # for heading, ** for bold, * for italic, - for list, [text](url) for links</span>
      </div>
    </div>
  );
}
