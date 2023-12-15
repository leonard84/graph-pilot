import cytoscape, { ElementDefinition } from 'cytoscape';
import Graph from './Graph';

const container: HTMLElement = document.getElementById('cy');
const generateGraphButton: HTMLElement = document.getElementById('generateGraph');
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
    generateGraphButton.addEventListener('click', () => {
        const input: string = (document.getElementById('graphInput') as HTMLInputElement).value;
        const graph: Graph = new Graph();
        graph.parseGraph(input);
        graph.calculateEdgeWeights();
        console.log(graph.toString());
        const elements: ElementDefinition[] = graph.exportToCytoscape();
        const cy = cytoscape({
            container,
            elements,
            style: graphStyle,
            layout: {
                name: 'grid',
            }
        });
        
    });
}