import { describe, it, expect } from "vitest";
import {
  toReactFlowNodes,
  toReactFlowEdges,
  fromReactFlowNodes,
  fromReactFlowEdges,
  mapNodeType,
} from "./flowDataBridge";
import type { FlowNode, FlowEdge } from "@/hooks/useScriptFlows";
import type { Node, Edge } from "reactflow";

/**
 * Locks E1 flows findings:
 *  - F3  "node-type changes silently discarded" — the DB type must come from
 *        `data.nodeType` (which the node inspector writes), NOT from the React
 *        Flow render type `node.type`, which lags a type change.
 *  - F1/F5 AI-generated flows and JSON imports must survive the DB -> canvas ->
 *        DB round trip intact (they previously never reached the canvas and
 *        were then erased by autosave).
 *
 * Pure functions, no mocking.
 */

const ALL_TYPES: FlowNode["type"][] = [
  "start",
  "end",
  "script",
  "decision",
  "action",
  "hexagon",
  "parallelogram",
  "cylinder",
  "document",
];

const RF_TYPES: Record<FlowNode["type"], string> = {
  start: "scriptStart",
  end: "scriptEnd",
  script: "scriptNode",
  decision: "decisionNode",
  action: "actionNode",
  hexagon: "hexagonNode",
  parallelogram: "parallelogramNode",
  cylinder: "cylinderNode",
  document: "documentNode",
};

const dbNode = (over: Partial<FlowNode> = {}): FlowNode => ({
  id: "n1",
  scriptId: null,
  label: "Node 1",
  type: "script",
  x: 10,
  y: 20,
  ...over,
});

const dbEdge = (over: Partial<FlowEdge> = {}): FlowEdge => ({
  id: "e1",
  from: "n1",
  to: "n2",
  ...over,
});

describe("mapNodeType", () => {
  it("maps every DB node type to its React Flow component type", () => {
    for (const t of ALL_TYPES) {
      expect(mapNodeType(t)).toBe(RF_TYPES[t]);
    }
  });

  it("falls back to scriptNode for an unknown/legacy DB type instead of an unrendered node", () => {
    expect(mapNodeType("nonsense" as FlowNode["type"])).toBe("scriptNode");
    expect(mapNodeType(undefined as unknown as FlowNode["type"])).toBe("scriptNode");
    expect(mapNodeType(null as unknown as FlowNode["type"])).toBe("scriptNode");
  });
});

describe("toReactFlowNodes", () => {
  it("carries the DB type into BOTH node.type and data.nodeType", () => {
    const [rf] = toReactFlowNodes([dbNode({ type: "decision" })]);
    expect(rf.type).toBe("decisionNode");
    expect(rf.data.nodeType).toBe("decision");
  });

  it("maps position and all styling fields", () => {
    const [rf] = toReactFlowNodes([
      dbNode({
        x: 100,
        y: 250,
        scriptId: "s-1",
        customText: "hello",
        color: "#fff",
        borderStyle: "dashed",
        fontSize: 14,
        opacity: 0.5,
        shadow: true,
      }),
    ]);
    expect(rf.position).toEqual({ x: 100, y: 250 });
    expect(rf.data).toMatchObject({
      label: "Node 1",
      scriptId: "s-1",
      customText: "hello",
      color: "#fff",
      borderStyle: "dashed",
      fontSize: 14,
      opacity: 0.5,
      shadow: true,
    });
  });

  it("returns an empty array for an empty flow (does not throw)", () => {
    expect(toReactFlowNodes([])).toEqual([]);
  });
});

describe("fromReactFlowNodes — F3: node-type changes must not be discarded", () => {
  it("REGRESSION: data.nodeType wins over a stale node.type", () => {
    // The inspector updates data.nodeType; node.type can still be the old
    // component. Persisting node.type is exactly the bug F3 fixed.
    const rf = [
      {
        id: "n1",
        type: "scriptNode",
        position: { x: 0, y: 0 },
        data: { label: "L", nodeType: "decision" },
      },
    ] as unknown as Node[];
    expect(fromReactFlowNodes(rf)[0].type).toBe("decision");
  });

  it("falls back to reverse-mapping node.type when data.nodeType is absent", () => {
    for (const t of ALL_TYPES) {
      const rf = [
        {
          id: "n1",
          type: RF_TYPES[t],
          position: { x: 0, y: 0 },
          data: { label: "L" },
        },
      ] as unknown as Node[];
      expect(fromReactFlowNodes(rf)[0].type).toBe(t);
    }
  });

  it("an unknown/absent React Flow type reverse-maps to 'script', never to undefined", () => {
    const rf = [
      { id: "n1", type: "mysteryNode", position: { x: 0, y: 0 }, data: {} },
      { id: "n2", position: { x: 0, y: 0 }, data: {} },
    ] as unknown as Node[];
    const out = fromReactFlowNodes(rf);
    expect(out[0].type).toBe("script");
    expect(out[1].type).toBe("script");
  });

  it("rounds fractional drag positions so the DB never stores sub-pixel drift", () => {
    const rf = [
      { id: "n1", type: "scriptNode", position: { x: 10.4, y: -3.6 }, data: {} },
    ] as unknown as Node[];
    expect(fromReactFlowNodes(rf)[0]).toMatchObject({ x: 10, y: -4 });
  });

  it("a node with no data object does not crash and gets safe defaults", () => {
    const rf = [
      { id: "n1", type: "scriptNode", position: { x: 0, y: 0 } },
    ] as unknown as Node[];
    expect(() => fromReactFlowNodes(rf)).not.toThrow();
    const [n] = fromReactFlowNodes(rf);
    expect(n.label).toBe("");
    expect(n.scriptId).toBeNull();
    expect(n.type).toBe("script");
  });
});

describe("node round-trips", () => {
  it("DB -> React Flow -> DB is lossless for every node type", () => {
    const nodes: FlowNode[] = ALL_TYPES.map((t, i) =>
      dbNode({ id: `n${i}`, type: t, label: `Node ${t}`, x: i * 10, y: i * 5 }),
    );
    const back = fromReactFlowNodes(toReactFlowNodes(nodes));
    expect(back.map((n) => n.type)).toEqual(ALL_TYPES);
    expect(back.map((n) => n.id)).toEqual(nodes.map((n) => n.id));
    expect(back.map((n) => n.label)).toEqual(nodes.map((n) => n.label));
    expect(back.map((n) => [n.x, n.y])).toEqual(nodes.map((n) => [n.x, n.y]));
  });

  it("REGRESSION (F5/F7): a full AI-generated / imported flow survives the round trip", () => {
    const generated: FlowNode[] = [
      dbNode({ id: "a", type: "start", label: "Open", x: 0, y: 0 }),
      dbNode({ id: "b", type: "decision", label: "Interested?", x: 0, y: 120 }),
      dbNode({ id: "c", type: "script", label: "Pitch", x: -150, y: 260, scriptId: "s-9" }),
      dbNode({ id: "d", type: "end", label: "Close", x: 150, y: 260 }),
    ];
    const back = fromReactFlowNodes(toReactFlowNodes(generated));
    expect(back).toHaveLength(4);
    expect(back).toEqual(
      generated.map((n) => expect.objectContaining({ id: n.id, type: n.type, label: n.label })),
    );
    // A generated flow must never come back empty — that emptiness is what
    // autosave used to write over the real flow.
    expect(back.length).toBeGreaterThan(0);
  });

  it("styling survives the round trip; absent optional styling stays absent", () => {
    const styled = dbNode({
      color: "#123456",
      borderStyle: "dotted",
      fontSize: 20,
      opacity: 0.25,
      shadow: true,
      customText: "note",
    });
    const [back] = fromReactFlowNodes(toReactFlowNodes([styled]));
    expect(back).toMatchObject({
      color: "#123456",
      borderStyle: "dotted",
      fontSize: 20,
      opacity: 0.25,
      shadow: true,
      customText: "note",
    });

    const [plain] = fromReactFlowNodes(toReactFlowNodes([dbNode()]));
    expect(plain.color).toBeUndefined();
    expect(plain.borderStyle).toBeUndefined();
  });
});

describe("edge mapping and round-trips", () => {
  it("maps from/to onto source/target and always uses the custom edge renderer", () => {
    const [rf] = toReactFlowEdges([dbEdge({ label: "yes", condition: "yes" })]);
    expect(rf.source).toBe("n1");
    expect(rf.target).toBe("n2");
    expect(rf.type).toBe("scriptFlowEdge");
    expect(rf.label).toBe("yes");
    expect(rf.data).toMatchObject({ label: "yes", condition: "yes" });
  });

  it("DB -> React Flow -> DB is lossless for a fully-specified edge", () => {
    const edges: FlowEdge[] = [
      dbEdge({
        id: "e1",
        label: "No reply",
        condition: "no-reply",
        edgeType: "smoothstep",
        lineStyle: "dashed",
        animated: true,
        color: "#abcdef",
      }),
    ];
    expect(fromReactFlowEdges(toReactFlowEdges(edges))).toEqual(edges);
  });

  it("a bare edge round-trips without inventing values", () => {
    const [back] = fromReactFlowEdges(toReactFlowEdges([dbEdge()]));
    expect(back.id).toBe("e1");
    expect(back.from).toBe("n1");
    expect(back.to).toBe("n2");
    expect(back.label).toBeUndefined();
    expect(back.animated).toBeUndefined();
  });

  it("falls back to the top-level string label when data.label is missing", () => {
    const rf = [
      { id: "e1", source: "a", target: "b", label: "fallback" },
    ] as unknown as Edge[];
    expect(fromReactFlowEdges(rf)[0].label).toBe("fallback");
  });

  it("ignores a non-string (JSX) top-level label rather than persisting an object", () => {
    const rf = [
      { id: "e1", source: "a", target: "b", label: { type: "span" } },
    ] as unknown as Edge[];
    expect(fromReactFlowEdges(rf)[0].label).toBeUndefined();
  });

  it("an edge with no data object does not crash", () => {
    const rf = [{ id: "e1", source: "a", target: "b" }] as unknown as Edge[];
    expect(() => fromReactFlowEdges(rf)).not.toThrow();
    expect(fromReactFlowEdges(rf)[0]).toMatchObject({ id: "e1", from: "a", to: "b" });
  });

  it("empty edge lists map to empty arrays both ways", () => {
    expect(toReactFlowEdges([])).toEqual([]);
    expect(fromReactFlowEdges([])).toEqual([]);
  });
});
