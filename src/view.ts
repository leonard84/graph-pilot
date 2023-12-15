import cytoscape, { ElementDefinition } from 'cytoscape';
import Graph from './Graph';

const colorPalette = [
    '#00ffff',
    '#00ff00',
    '#ffff00',
    '#ff8000',
    '#ff0000'
];
const maxWeight = 5;

const container: HTMLElement = document.getElementById('cy')!;
const generateGraphButton: HTMLElement = document.getElementById('generateGraph')!;
const graphStyle = [
    {
        selector: 'node',
        style: {
            'background-color': '#666',
            'label': 'data(label)'
        }
    },
    {
        selector: 'node.on-path',
        style: {
            'background-color': '#0d6efd',
            'label': 'data(label)'
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(weight)',
            'opacity': 0.1
        }
    },
    {
        selector: 'edge.from-selected',
        style: {
            'width': 5,
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(weight)',
            'z-index': 9999,
            'opacity': 1
        }
    },
    {
        selector: 'edge.on-path',
        style: {
            'width': 3,
            'line-color': '#0d6efd',
            'target-arrow-color': '#0d6efd',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(weight)',
            'opacity': 0.75
        }
    }
]

export function initView() {
    const oldValue = localStorage.getItem('graphInput');
    if (oldValue) {
        (document.getElementById('graphInput') as HTMLInputElement).value = oldValue;
        parseAndDisplayGraph(oldValue);
    }

    generateGraphButton.addEventListener('click', () => {
        const input: string = (document.getElementById('graphInput') as HTMLInputElement).value;
        localStorage.setItem('graphInput', input);
        parseAndDisplayGraph(input);
    });
}

function parseAndDisplayGraph(input: string) {
    const graph: Graph = new Graph();
    graph.parseGraph(input);
    graph.calculateEdgeWeights();
    console.log(graph.toString());
    createGraph(graph);
}

function createGraph(graph: Graph) {
    const elements: ElementDefinition[] = graph.exportToCytoscape();
    const selected: string[] = [];
    const cy = cytoscape({
        container,
        elements,
        style: graphStyle,
        layout: {
            name: 'grid',
        }
    });
    cy.on('tap', 'node', function (evt) {
        var node = evt.target;
        console.log('tapped ' + node.id());
        console.log(node.data());
        if (selected.indexOf(node.id()) === -1) {
            if (selected.length > 0) {
                const hasValidConnection = node.incomers(`edge[source="${selected[selected.length - 1]}"]`).length > 0;
                if (!hasValidConnection) {
                    return;
                }
                // Hide all outgoing edges from the previously selected node
                hideOutgoingEdges(selected[selected.length - 1]);
            }

            selected.push(node.id());
            node.addClass('on-path');
            hideIncommingEdgesAndHighlightOutgoingEdges(node.id());
            highlightPath(selected);
        } else {
            removeNodeFromPath(node.id());
            highlightPath(selected);
        }
    });
    
    function removeNodeFromPath(nodeId: string) {
        const index = selected.indexOf(nodeId);
        if (index !== -1) {
            const removedNodes = selected.splice(index);
            removedNodes.forEach((removedNode) => {
                const node = cy.getElementById(removedNode);
                node.removeClass('on-path');
                showIncommingEdgesAndRemoveOutgoingEdges(removedNode);
            });
        }
        if (selected.length > 0) {
            const previousNode = selected[selected.length - 1];
            highlightOutgoingEdges(previousNode, true);
        }
    }

    function showIncommingEdgesAndRemoveOutgoingEdges(nodeId: string) {
        resetIncommingEdges(nodeId);
        resetOutgoingEdges(nodeId);
    }

    function resetIncommingEdges(nodeId: string) {
        const node = cy.getElementById(nodeId);
        const incommingEdges = node.incomers('edge');
        incommingEdges.removeStyle('display');
        incommingEdges.removeStyle('line-color');
        incommingEdges.removeStyle('target-arrow-color');
        incommingEdges.removeClass('on-path');
        incommingEdges.removeClass('from-selected');
    }

    function resetOutgoingEdges(nodeId: string) {
        const node = cy.getElementById(nodeId);
        const outgoingEdges = node.outgoers('edge');
        outgoingEdges.removeStyle('display');
        outgoingEdges.removeStyle('line-color');
        outgoingEdges.removeStyle('target-arrow-color');
        outgoingEdges.removeClass('on-path');
        outgoingEdges.removeClass('from-selected');
    }
    

    function highlightPath(selected: string[]) {
        const filter = generatePairwiseEntries(selected)
        for (const filterEntry of filter) {
            const pathEdges = cy.edges(filterEntry);
            pathEdges.removeStyle('display');
            pathEdges.addClass('on-path');
        }
    }

    function generatePairwiseEntries(selected: string[]): string[] {
        const entries: string[] = [];

        for (let i = 0; i < selected.length - 1; i++) {
            const entry = `[source="${selected[i]}"][target="${selected[i + 1]}"]`;
            entries.push(entry);
        }

        return entries;
    }

    function hideOutgoingEdges(nodeId: string) {
        const previousNode = cy.getElementById(nodeId);
        const outgoingEdges = previousNode.outgoers('edge');
        outgoingEdges.style('display', 'none');
        outgoingEdges.removeClass('from-selected');
        outgoingEdges.removeStyle('line-color');
        outgoingEdges.removeStyle('target-arrow-color');
    }

    function hideIncommingEdges(nodeId: string) {
        const node = cy.getElementById(nodeId);
        const incommingEdges = node.incomers('edge');
        incommingEdges.style('display', 'none');
    }

    function highlightOutgoingEdges(nodeId: string, unhide: boolean = false) {
        const node = cy.getElementById(nodeId);
        const outgoingEdges = node.outgoers('edge');

        outgoingEdges.forEach(edge => {
            const weight = edge.data('weight');

            if (weight >= 1) {
                const colorIndex = Math.floor((weight - 1) / (maxWeight - 1) * (colorPalette.length - 1));
                const lineColor = colorPalette[colorIndex];

                if (unhide) {
                    edge.removeStyle('display');
                }
                edge.style('line-color', lineColor);
                edge.style('target-arrow-color', lineColor);
                edge.addClass('from-selected');
            }
        });
    }

    function hideIncommingEdgesAndHighlightOutgoingEdges(nodeId: string) {
        hideIncommingEdges(nodeId);
        highlightOutgoingEdges(nodeId);
    }
}