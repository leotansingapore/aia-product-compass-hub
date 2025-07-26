import React from 'react';
import { Card } from '../ui/card';
import { Type, List, CheckSquare, Quote, Code, Minus } from 'lucide-react';

interface SlashCommand {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  action: () => void;
}

interface SlashCommandMenuProps {
  onCommand: (command: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function SlashCommandMenu({ onCommand, onClose, position }: SlashCommandMenuProps) {
  const commands: SlashCommand[] = [
    {
      id: 'heading1',
      label: 'Heading 1',
      icon: <Type className="w-4 h-4" />,
      description: 'Large section heading',
      action: () => onCommand('heading1'),
    },
    {
      id: 'heading2',
      label: 'Heading 2',
      icon: <Type className="w-4 h-4" />,
      description: 'Medium section heading',
      action: () => onCommand('heading2'),
    },
    {
      id: 'heading3',
      label: 'Heading 3',
      icon: <Type className="w-4 h-4" />,
      description: 'Small section heading',
      action: () => onCommand('heading3'),
    },
    {
      id: 'bullet',
      label: 'Bullet List',
      icon: <List className="w-4 h-4" />,
      description: 'Create a bulleted list',
      action: () => onCommand('bullet'),
    },
    {
      id: 'numbered',
      label: 'Numbered List',
      icon: <List className="w-4 h-4" />,
      description: 'Create a numbered list',
      action: () => onCommand('numbered'),
    },
    {
      id: 'todo',
      label: 'To-do List',
      icon: <CheckSquare className="w-4 h-4" />,
      description: 'Track tasks with checkboxes',
      action: () => onCommand('todo'),
    },
    {
      id: 'quote',
      label: 'Quote',
      icon: <Quote className="w-4 h-4" />,
      description: 'Capture a quote',
      action: () => onCommand('quote'),
    },
    {
      id: 'code',
      label: 'Code',
      icon: <Code className="w-4 h-4" />,
      description: 'Capture a code snippet',
      action: () => onCommand('code'),
    },
    {
      id: 'divider',
      label: 'Divider',
      icon: <Minus className="w-4 h-4" />,
      description: 'Visually divide blocks',
      action: () => onCommand('divider'),
    },
  ];

  return (
    <Card 
      className="absolute z-50 w-64 p-2 shadow-lg border bg-card"
      style={{ 
        left: position.x, 
        top: position.y,
        transform: 'translateY(-100%)'
      }}
    >
      {commands.map((command) => (
        <div
          key={command.id}
          className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-accent transition-colors"
          onClick={() => {
            command.action();
            onClose();
          }}
        >
          <div className="text-muted-foreground">{command.icon}</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">{command.label}</div>
            <div className="text-xs text-muted-foreground">{command.description}</div>
          </div>
        </div>
      ))}
    </Card>
  );
}