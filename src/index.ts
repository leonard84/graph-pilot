import cytoscape, { ElementDefinition } from 'cytoscape';


document.getElementById('generateGraph')!.addEventListener('click', () => {
    const input: string = (document.getElementById('graphInput') as HTMLInputElement).value;
    const elements: ElementDefinition[] = parseGraphNotation(input);
    const cy = cytoscape({
        container: document.getElementById('cy'),
        elements: elements,
        style: [
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
        ],
        layout: {
            name: 'grid',
            rows: 1
        }
    });
});

function parseGraphNotation(input: string): ElementDefinition[] {
    const elements: ElementDefinition[] = [];
    const edgeRegex: RegExp = /\((.+?)\)\s*->\s*\((.+?)\)/g;
    let match: RegExpExecArray | null;

    while ((match = edgeRegex.exec(input)) !== null) {
        elements.push({ data: { id: match[1] } });
        elements.push({ data: { id: match[2] } });
        elements.push({ data: { source: match[1], target: match[2], weight: '' } });
    }

    return elements;
}
