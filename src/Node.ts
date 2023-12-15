type Metadata = { [key: string]: any };

class Node {
    key: string;
    label: string;
    metadata: Metadata;

    constructor(key: string, label: string, metadata: Metadata = {}) {
        this.key = key;
        this.label = label;
        this.metadata = metadata;
    }
}

export default Node;
