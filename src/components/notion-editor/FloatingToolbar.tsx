import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Bold, Italic, Link, Code } from 'lucide-react';

interface FloatingToolbarProps {
  onFormat: (format: string) => void;
  onLink: () => void;
  position: { x: number; y: number };
  visible: boolean;
}

export function FloatingToolbar({ onFormat, onLink, position, visible }: FloatingToolbarProps) {
  if (!visible) return null;

  return (
    <Card 
      className="absolute z-50 p-1 shadow-lg border bg-card flex items-center gap-1"
      style={{ 
        left: position.x, 
        top: position.y - 50,
        transform: 'translateX(-50%)'
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormat('bold')}
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormat('italic')}
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onFormat('code')}
      >
        <Code className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onLink}
      >
        <Link className="w-4 h-4" />
      </Button>
    </Card>
  );
}