import cytoscape, { ElementDefinition } from 'cytoscape';
import Graph from './Graph';

const container: HTMLElement = document.getElementById('cy')!;
const generateGraphButton: HTMLElement = document.getElementById('generateGraph')!;
const graphStyle = [
    {
        selector: 'node',
        style: {
            'background-color': '#666',
            'label': 'data(id)'
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
            'label': 'data(weight)'
        }
    }
]

export function initView() {
    const oldValue =  localStorage.getItem('graphInput');
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
    const selected:string[] = [];
    const cy = cytoscape({
        container,
        elements,
        style: graphStyle,
        layout: {
            name: 'grid',
        }
    });
    cy.on('tap', 'node', function(evt){
        var node = evt.target;
        console.log( 'tapped ' + node.id() );
        console.log(node.data());
        if (selected.indexOf(node.id()) === -1) {
            selected.push(node.id());
            node.style('background-color', '#0d6efd');
        } else {
            selected.splice(selected.indexOf(node.id()), 1);
            node.style('background-color', '#666');
        }
      });
}