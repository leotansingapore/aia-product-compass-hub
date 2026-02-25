import { useRef, useCallback } from 'react';
import { useFlowAnnotations, type FlowAnnotation } from '@/hooks/useFlowAnnotations';
import { StickyNoteAnnotation } from './StickyNoteAnnotation';
import { TextLabelAnnotation } from './TextLabelAnnotation';
import { CommentAnnotation } from './CommentAnnotation';
import { DrawingLayer } from './DrawingLayer';
import type { AnnotationTool } from './AnnotationToolbar';

interface Props {
  flowId: string;
  activeTool: AnnotationTool;
  activeColor: string;
  penWidth: number;
  zoom: number;
  panX: number;
  panY: number;
  containerRef: React.RefObject<HTMLDivElement>;
  onToolUsed: () => void; // callback to optionally reset tool after use
}

export function AnnotationLayer({
  flowId,
  activeTool,
  activeColor,
  penWidth,
  zoom,
  panX,
  panY,
  containerRef,
  onToolUsed,
}: Props) {
  const {
    annotations,
    repliesFor,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    currentUserId,
  } = useFlowAnnotations(flowId);

  // Handle canvas click to place sticky / text / comment
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'none' || activeTool === 'drawing') return;
    if ((e.target as HTMLElement).closest('[data-annotation]')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    // Convert to flow coordinates
    const flowX = (screenX - panX) / zoom;
    const flowY = (screenY - panY) / zoom;

    const defaults: Record<string, Partial<FlowAnnotation>> = {
      sticky:  { type: 'sticky',  width: 180, height: 130, content: '' },
      text:    { type: 'text',    width: 120, height: 30,  content: 'Label' },
      comment: { type: 'comment', width: 220, height: 80,  content: 'Comment here' },
    };

    addAnnotation({
      ...defaults[activeTool],
      x: flowX,
      y: flowY,
      color: activeColor,
      drawing_paths: null,
      parent_id: null,
      resolved: false,
    } as Omit<FlowAnnotation, 'id' | 'flow_id' | 'user_id' | 'author_name' | 'created_at' | 'updated_at'>);

    onToolUsed();
  }, [activeTool, activeColor, zoom, panX, panY, addAnnotation, onToolUsed]);

  const handleSaveDrawing = useCallback((paths: { d: string; color: string; width: number }[], x: number, y: number) => {
    addAnnotation({
      type: 'drawing',
      x,
      y,
      width: 0,
      height: 0,
      content: null,
      color: activeColor,
      drawing_paths: paths,
      parent_id: null,
      resolved: false,
    } as Omit<FlowAnnotation, 'id' | 'flow_id' | 'user_id' | 'author_name' | 'created_at' | 'updated_at'>);
  }, [addAnnotation, activeColor]);

  const handleReply = useCallback((parentId: string, content: string) => {
    const parent = annotations.find(a => a.id === parentId);
    if (!parent) return;
    addAnnotation({
      type: 'comment',
      x: parent.x,
      y: parent.y,
      width: parent.width,
      height: parent.height,
      content,
      color: parent.color,
      drawing_paths: null,
      parent_id: parentId,
      resolved: false,
    } as Omit<FlowAnnotation, 'id' | 'flow_id' | 'user_id' | 'author_name' | 'created_at' | 'updated_at'>);
  }, [annotations, addAnnotation]);

  const canEdit = !!currentUserId;

  const sticky    = annotations.filter(a => a.type === 'sticky');
  const textLabels = annotations.filter(a => a.type === 'text');
  const comments  = annotations.filter(a => a.type === 'comment');
  const drawings  = annotations.filter(a => a.type === 'drawing');

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        zIndex: activeTool === 'drawing' ? 40 : activeTool !== 'none' ? 35 : 21,
        cursor: activeTool === 'drawing' ? 'crosshair' : activeTool !== 'none' ? 'crosshair' : 'default',
        // When no tool active, layer is non-interactive (annotations are still visible via child pointer-events)
        pointerEvents: activeTool !== 'none' ? 'all' : 'none',
      }}
      onClick={handleCanvasClick}
      data-annotation-layer
    >
      {/* Drawings */}
      <DrawingLayer
        annotations={drawings}
        isDrawing={activeTool === 'drawing'}
        penColor={activeColor}
        penWidth={penWidth}
        onSaveDrawing={handleSaveDrawing}
        containerRef={containerRef}
        onDelete={deleteAnnotation}
        zoom={zoom}
        panX={panX}
        panY={panY}
      />

      {/* Sticky notes */}
      {sticky.map(ann => (
        <div key={ann.id} data-annotation="true" style={{ pointerEvents: 'all' }}>
          <StickyNoteAnnotation
            annotation={ann}
            onUpdate={updateAnnotation}
            onDelete={deleteAnnotation}
            zoom={zoom}
            canEdit={canEdit}
            panX={panX}
            panY={panY}
          />
        </div>
      ))}

      {/* Text labels */}
      {textLabels.map(ann => (
        <div key={ann.id} data-annotation="true" style={{ pointerEvents: 'all' }}>
          <TextLabelAnnotation
            annotation={ann}
            onUpdate={updateAnnotation}
            onDelete={deleteAnnotation}
            zoom={zoom}
            canEdit={canEdit}
            panX={panX}
            panY={panY}
          />
        </div>
      ))}

      {/* Comments */}
      {comments.map(ann => (
        <div key={ann.id} data-annotation="true" style={{ pointerEvents: 'all' }}>
          <CommentAnnotation
            annotation={ann}
            replies={repliesFor(ann.id)}
            onUpdate={updateAnnotation}
            onDelete={deleteAnnotation}
            onReply={handleReply}
            zoom={zoom}
            canEdit={canEdit}
            panX={panX}
            panY={panY}
            currentUserId={currentUserId}
          />
        </div>
      ))}
    </div>
  );
}
