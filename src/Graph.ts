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

    parseNode(input: string): Node {
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
                const node = this.parseNode(trimmedLine);
                this.addNode(node);
            }
        }
    }
}
    
export default Graph;
