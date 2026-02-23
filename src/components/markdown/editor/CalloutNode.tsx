import { Node, mergeAttributes } from '@tiptap/react';
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react';
import { Info, AlertTriangle, Lightbulb } from 'lucide-react';

const variantConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
    label: 'Info',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-500',
    label: 'Warning',
  },
  tip: {
    icon: Lightbulb,
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-500',
    label: 'Tip',
  },
};

export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      variant: { default: 'info' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
        getAttrs: (element) => ({
          variant: (element as HTMLElement).getAttribute('data-variant') || 'info',
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'callout',
        'data-variant': HTMLAttributes.variant,
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent);
  },
});

function CalloutComponent({ node, updateAttributes }: any) {
  const variant = (node.attrs.variant || 'info') as keyof typeof variantConfig;
  const config = variantConfig[variant] || variantConfig.info;
  const Icon = config.icon;

  const cycleVariant = () => {
    const variants: Array<keyof typeof variantConfig> = ['info', 'warning', 'tip'];
    const currentIdx = variants.indexOf(variant);
    const nextVariant = variants[(currentIdx + 1) % variants.length];
    updateAttributes({ variant: nextVariant });
  };

  return (
    <NodeViewWrapper className="my-3">
      <div className={`flex gap-3 p-4 rounded-lg border ${config.bg} ${config.border}`}>
        <button
          onClick={cycleVariant}
          className={`shrink-0 mt-0.5 ${config.iconColor} hover:opacity-70 transition-opacity`}
          title={`Click to change type (current: ${config.label})`}
          contentEditable={false}
        >
          <Icon className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <NodeViewContent className="callout-content" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
