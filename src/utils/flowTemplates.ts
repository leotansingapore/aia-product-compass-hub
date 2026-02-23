import type { FlowNode, FlowEdge } from '@/hooks/useScriptFlows';

export interface FlowTemplate {
  title: string;
  description: string;
  category: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    title: 'Cold Lead → Meeting',
    description: 'Full flow from cold call to booking a meetup: text first → call → post-call → follow-ups',
    category: 'prospecting',
    nodes: [
      { id: 'n1', scriptId: null, label: 'Send Initial Text', type: 'start', x: 400, y: 50 },
      { id: 'n2', scriptId: null, label: 'Make Cold Call', type: 'script', x: 400, y: 170 },
      { id: 'n3', scriptId: null, label: 'Did They Answer?', type: 'decision', x: 400, y: 290 },
      { id: 'n4', scriptId: null, label: 'Post-Call Text (Interested)', type: 'script', x: 200, y: 410 },
      { id: 'n5', scriptId: null, label: 'Post-Call Text (Not Interested)', type: 'script', x: 600, y: 410 },
      { id: 'n6', scriptId: null, label: 'Follow-Up Day 2', type: 'script', x: 200, y: 530 },
      { id: 'n7', scriptId: null, label: 'Meeting Booked ✓', type: 'end', x: 200, y: 650 },
      { id: 'n8', scriptId: null, label: 'Mark as Cold', type: 'end', x: 600, y: 530 },
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2', label: 'Next day' },
      { id: 'e2', from: 'n2', to: 'n3' },
      { id: 'e3', from: 'n3', to: 'n4', label: 'Yes', condition: 'yes' },
      { id: 'e4', from: 'n3', to: 'n5', label: 'No', condition: 'no' },
      { id: 'e5', from: 'n4', to: 'n6', label: 'No reply' },
      { id: 'e6', from: 'n6', to: 'n7', label: 'Confirmed' },
      { id: 'e7', from: 'n5', to: 'n8' },
    ],
  },
  {
    title: 'NSF Outreach Flow',
    description: 'NSF-specific outreach with adulting guidebook angle and follow-up sequence',
    category: 'prospecting',
    nodes: [
      { id: 'n1', scriptId: null, label: 'Cold Call (NSF Angle)', type: 'start', x: 400, y: 50 },
      { id: 'n2', scriptId: null, label: 'Serving NS?', type: 'decision', x: 400, y: 170 },
      { id: 'n3', scriptId: null, label: 'Offer Adulting Guidebook', type: 'script', x: 200, y: 290 },
      { id: 'n4', scriptId: null, label: 'Offer General Guidebook', type: 'script', x: 600, y: 290 },
      { id: 'n5', scriptId: null, label: 'Interested?', type: 'decision', x: 400, y: 410 },
      { id: 'n6', scriptId: null, label: 'Send WhatsApp Details', type: 'script', x: 200, y: 530 },
      { id: 'n7', scriptId: null, label: 'Thank & Close', type: 'end', x: 600, y: 530 },
      { id: 'n8', scriptId: null, label: 'Book Meetup', type: 'end', x: 200, y: 650 },
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2' },
      { id: 'e2', from: 'n2', to: 'n3', label: 'Yes (NSF)', condition: 'yes' },
      { id: 'e3', from: 'n2', to: 'n4', label: 'No', condition: 'no' },
      { id: 'e4', from: 'n3', to: 'n5' },
      { id: 'e5', from: 'n4', to: 'n5' },
      { id: 'e6', from: 'n5', to: 'n6', label: 'Yes', condition: 'yes' },
      { id: 'e7', from: 'n5', to: 'n7', label: 'No', condition: 'no' },
      { id: 'e8', from: 'n6', to: 'n8' },
    ],
  },
  {
    title: 'Post-Meeting Nurture',
    description: 'After first meeting: resources → referral ask → ongoing check-ins',
    category: 'nurture',
    nodes: [
      { id: 'n1', scriptId: null, label: 'Send Post-Meeting Text', type: 'start', x: 400, y: 50 },
      { id: 'n2', scriptId: null, label: 'Share Resources & Links', type: 'script', x: 400, y: 170 },
      { id: 'n3', scriptId: null, label: 'Wait 2 Days', type: 'action', x: 400, y: 290 },
      { id: 'n4', scriptId: null, label: 'Ask for Referral', type: 'script', x: 400, y: 410 },
      { id: 'n5', scriptId: null, label: 'Got Referral?', type: 'decision', x: 400, y: 530 },
      { id: 'n6', scriptId: null, label: 'Follow Up with Referral', type: 'script', x: 200, y: 650 },
      { id: 'n7', scriptId: null, label: 'Schedule Check-In', type: 'end', x: 500, y: 650 },
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2' },
      { id: 'e2', from: 'n2', to: 'n3' },
      { id: 'e3', from: 'n3', to: 'n4' },
      { id: 'e4', from: 'n4', to: 'n5' },
      { id: 'e5', from: 'n5', to: 'n6', label: 'Yes', condition: 'yes' },
      { id: 'e6', from: 'n5', to: 'n7', label: 'No', condition: 'no' },
    ],
  },
  {
    title: 'No-Reply Recovery',
    description: 'Sequence of escalating follow-ups for unresponsive leads',
    category: 'follow-up',
    nodes: [
      { id: 'n1', scriptId: null, label: 'Initial Message Sent', type: 'start', x: 400, y: 50 },
      { id: 'n2', scriptId: null, label: 'Wait 2 Days', type: 'action', x: 400, y: 150 },
      { id: 'n3', scriptId: null, label: '1st Follow-Up', type: 'script', x: 400, y: 250 },
      { id: 'n4', scriptId: null, label: 'Got Reply?', type: 'decision', x: 400, y: 370 },
      { id: 'n5', scriptId: null, label: 'Book Meeting', type: 'end', x: 200, y: 470 },
      { id: 'n6', scriptId: null, label: '2nd Follow-Up', type: 'script', x: 550, y: 470 },
      { id: 'n7', scriptId: null, label: 'Got Reply?', type: 'decision', x: 550, y: 590 },
      { id: 'n8', scriptId: null, label: '3rd Follow-Up (Final)', type: 'script', x: 550, y: 710 },
      { id: 'n9', scriptId: null, label: 'Mark as No Reply in CRM', type: 'end', x: 550, y: 830 },
    ],
    edges: [
      { id: 'e1', from: 'n1', to: 'n2' },
      { id: 'e2', from: 'n2', to: 'n3' },
      { id: 'e3', from: 'n3', to: 'n4' },
      { id: 'e4', from: 'n4', to: 'n5', label: 'Yes', condition: 'yes' },
      { id: 'e5', from: 'n4', to: 'n6', label: 'No Reply', condition: 'no-reply' },
      { id: 'e6', from: 'n6', to: 'n7' },
      { id: 'e7', from: 'n7', to: 'n5', label: 'Yes', condition: 'yes' },
      { id: 'e8', from: 'n7', to: 'n8', label: 'No Reply', condition: 'no-reply' },
      { id: 'e9', from: 'n8', to: 'n9' },
    ],
  },
];
