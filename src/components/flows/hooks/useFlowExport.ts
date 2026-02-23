import { useCallback } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import type { Node, Edge } from 'reactflow';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function useFlowExport() {
  const exportAsPng = useCallback(
    async (element: HTMLElement, filename: string): Promise<void> => {
      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        filter: (node) => {
          // Exclude React Flow controls/minimap from export
          const classList = (node as HTMLElement).classList;
          if (!classList) return true;
          return (
            !classList.contains('react-flow__minimap') &&
            !classList.contains('react-flow__controls') &&
            !classList.contains('react-flow__panel')
          );
        },
      });

      downloadDataUrl(dataUrl, filename.endsWith('.png') ? filename : `${filename}.png`);
    },
    []
  );

  const exportAsPdf = useCallback(
    async (element: HTMLElement, filename: string): Promise<void> => {
      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        filter: (node) => {
          const classList = (node as HTMLElement).classList;
          if (!classList) return true;
          return (
            !classList.contains('react-flow__minimap') &&
            !classList.contains('react-flow__controls') &&
            !classList.contains('react-flow__panel')
          );
        },
      });

      // Create an image to get dimensions
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const imgWidth = img.width;
      const imgHeight = img.height;

      // Determine PDF orientation based on aspect ratio
      const isLandscape = imgWidth > imgHeight;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    },
    []
  );

  const exportAsJson = useCallback(
    async (nodes: Node[], edges: Edge[], title: string): Promise<void> => {
      const data = {
        title,
        exportedAt: new Date().toISOString(),
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type,
          data: e.data,
        })),
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      downloadBlob(blob, `${safeTitle}.json`);
    },
    []
  );

  const generateThumbnail = useCallback(
    async (element: HTMLElement): Promise<string> => {
      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 0.5,
        quality: 0.6,
        filter: (node) => {
          const classList = (node as HTMLElement).classList;
          if (!classList) return true;
          return (
            !classList.contains('react-flow__minimap') &&
            !classList.contains('react-flow__controls') &&
            !classList.contains('react-flow__panel')
          );
        },
      });

      return dataUrl;
    },
    []
  );

  return {
    exportAsPng,
    exportAsPdf,
    exportAsJson,
    generateThumbnail,
  };
}
