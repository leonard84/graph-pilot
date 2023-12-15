import { ElementDefinition } from 'cytoscape';
import Node from './Node';

/*
- the nodes have a key:string and a label:string, they can also have other metadata in a map
- the edges are represented as an adjacency matrix using weights as values
- the graph will be parsed from text input representing the nodes
-- the format for the nodes is `label: key {metadata}` with metadata being optional
-- the key consists of a single word with no spaces
-- the metadata follows json map notation
*/
class Graph {
    nodes: Node[];
    adjacencyMatrix: Map<string, Map<string, number>>;

    constructor() {
        this.nodes = [];
        this.adjacencyMatrix = new Map();
    }

    addNode(node: Node): void {
        this.nodes.push(node);
        this.adjacencyMatrix.set(node.key, new Map());
    }

    addEdge(fromKey: string, toKey: string, weight: number): void {
        const fromNodeEdges = this.adjacencyMatrix.get(fromKey);
        if (fromNodeEdges) {
            fromNodeEdges.set(toKey, weight);
        }
    }

    static parseNode(input: string): Node {
        const [labelKey, metadataString] = input.split('{');
        const [label, key] = labelKey.split(':').map(s => s.trim());
        let metadata = {};

        if (metadataString) {
            const metadataRaw = metadataString.slice(0, -1); // remove trailing '}'
            metadata = JSON.parse(`{${metadataRaw}}`);
        }

        return new Node(key, label, metadata);
    }

    parseGraph(input: string): void {
        const lines = input.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                const node = Graph.parseNode(trimmedLine);
                this.addNode(node);
            }
        }
    }

    static calculateEdgeWeight(sourceKey: string, targetKey: string): number {
        if (sourceKey === targetKey) {
            throw new Error("A node cannot link to itself.");
        }

        // Find the longest common substring between the suffix of sourceKey and the prefix of targetKey
        const getSuffixPrefixOverlap = (a: string, b: string): number => {
            let maxLength = 0;
            const limit = Math.min(a.length, b.length);

            // Start from the end of 'a' and the beginning of 'b'
            for (let i = 1; i < limit; i++) {
                const suffix = a.slice(a.length - i);
                const prefix = b.slice(0, i);
                if (suffix !== prefix) {
                    continue;
                }

                maxLength = i;
            }

            return maxLength;
        };

        return getSuffixPrefixOverlap(sourceKey, targetKey);
    }

    calculateEdgeWeights(): void {
        for (const [fromKey, fromNodeEdges] of this.adjacencyMatrix.entries()) {
            for (const [toKey] of fromNodeEdges.entries()) {
                const weight = Graph.calculateEdgeWeight(fromKey, toKey);
                this.addEdge(fromKey, toKey, weight);
            }
        }
    }

    exportToCytoscape(): ElementDefinition[] {
        const cytoscapeGraph: ElementDefinition[] = [];

        for (const node of this.nodes) {
            cytoscapeGraph.push({
                data: {
                    id: node.key,
                    label: node.label,
                    ...node.metadata
                }
            });

            const edges = this.adjacencyMatrix.get(node.key);
            if (edges) {
                for (const [toKey, weight] of edges.entries()) {
                    if (weight === 0) {
                        continue;
                    }
                    cytoscapeGraph.push({
                        data: {
                            source: node.key,
                            target: toKey,
                            weight
                        }
                    });
                }
            }
        }

        return cytoscapeGraph;
    }

    toString(): string {
        let output = '';
        for (const node of this.nodes) {
            output += `${node.label}: ${node.key} ${JSON.stringify(node.metadata)}\n`;
        }
        for (const [fromKey, fromNodeEdges] of this.adjacencyMatrix.entries()) {
            for (const [toKey, weight] of fromNodeEdges.entries()) {
                if (weight === 0) {
                    continue;
                }
                output += `(${fromKey}) -> (${toKey}) ${weight}\n`;
            }
        }
        return output;
    }
}

export default Graph;
