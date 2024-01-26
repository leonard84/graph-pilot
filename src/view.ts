import cytoscape, { ElementDefinition, EventObjectNode } from 'cytoscape';
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
const pathElement: HTMLElement = document.getElementById('path')!;
const pathListElement: HTMLElement = document.getElementById('pathList')!;
const generateGraphButton: HTMLElement = document.getElementById('generateGraph')!;
const dynamicLayoutToggle: HTMLInputElement = document.getElementById('dynamicLayout') as HTMLInputElement;
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

function useDynamicLayout() {
    return dynamicLayoutToggle.checked;
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
    cy.on('tap', 'node', function (evt: EventObjectNode) {
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
            addPathElement(node.id());
            updatePathProgressElement();

            updateLayout(node);
        } else {
            removeNodeFromPath(node.id());
            highlightPath(selected);
            updatePathProgressElement();
            if (selected.length > 0) {
                const previousNode = cy.getElementById(selected[selected.length - 1]);
                updateLayout(previousNode);
            } else {
                resetToGrid();
            }
        }
    });

    function resetToGrid() {
        cy.layout({
            name: 'grid',
        }).run();
    }

    function updateLayout(node: cytoscape.NodeSingular) {
        if (!useDynamicLayout()) return;

        const layoutPositions: { [id: string]: cytoscape.Position; } = {};
        const excluded = new Set(selected);
        // Assign positions based on your criteria
        selected.forEach((n, index) => {
            layoutPositions[n] = { x: 100 * index, y: 0 + (100 * (index & 1)) };
        });
        const baseX = 100 * selected.length;
        layoutPositions[node.id()] = { x: baseX, y: 0 };
        excluded.add(node.id());

        const reachable = node.outgoers('edge')
            .sort((a, b) => b.data('weight') - a.data('weight'));

        // Move all reachable nodes to the right of the selected nodes
        reachable
            .filter((e) => !excluded.has(e.target().id())) // hide all already selected nodes
            .forEach((edge, index) => {
                const target = edge.target();
                layoutPositions[target.id()] = { x: baseX + 1000 - 100 * edge.data('weight'), y: 50 * index };
                excluded.add(target.id());
            });

        cy.nodes()
            .filter((n) => !excluded.has(n.id())) // hide all already positioned nodes
            .forEach((n, index) => {
                layoutPositions[n.id()] = { x: 50 * index, y: reachable.size() * 50 + 100 + (50 * (index & 1)) };
            });

        // Apply a layout that sets nodes to the specified positions
        const layout = cy.layout({
            name: 'preset',
            positions: layoutPositions, // use the positions calculated above
            fit: true
        });

        layout.run();
    }

    function updatePathProgressElement() {
        let path = '';
        if (selected.length > 0) {
            path = selected[0];
        }
        for (let i = 1; i < selected.length; i++) {
            path += selected[i].substring(Graph.calculateEdgeWeight(selected[i - 1], selected[i]));
        }
        pathElement.textContent = addSpaces(path);
    }

    function addSpaces(str: string) {
        return str.replace(/(.{4})/g, '$1 ');
    }

    function addPathElement(nodeId: string) {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.id = nodeId;
        li.textContent = nodeId;
        pathListElement.appendChild(li);
    }

    function removePathElement(nodeId: string) {
        const li = document.getElementById(nodeId);
        if (li) {
            pathListElement.removeChild(li);
        }
    }

    function removeNodeFromPath(nodeId: string) {
        const index = selected.indexOf(nodeId);
        if (index !== -1) {
            const removedNodes = selected.splice(index);
            removedNodes.forEach((removedNode) => {
                const node = cy.getElementById(removedNode);
                node.removeClass('on-path');
                showIncommingEdgesAndRemoveOutgoingEdges(removedNode);
                removePathElement(removedNode);
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