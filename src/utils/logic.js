/**
 * Detects conflicts between operations in a schedule.
 * Conflicts occur between two operations on the same variable by different transactions,
 * where at least one of them is a Write.
 */
export const findConflicts = (steps) => {
    const conflicts = [];

    for (let i = 0; i < steps.length; i++) {
        for (let j = i + 1; j < steps.length; j++) {
            const op1 = steps[i];
            const op2 = steps[j];

            // Different transactions, same variable
            if (op1.txnId !== op2.txnId && op1.variable === op2.variable) {
                // At least one is a Write
                if (op1.type === 'W' || op2.type === 'W') {
                    conflicts.push({
                        from: op1.txnId,
                        to: op2.txnId,
                        variable: op1.variable,
                        op1: op1.type,
                        op2: op2.type
                    });
                }
            }
        }
    }

    return conflicts;
};

/**
 * Builds an adjacency list from conflicts.
 */
export const buildGraph = (conflicts, txns) => {
    const adj = {};
    txns.forEach(t => adj[t] = new Set());

    conflicts.forEach(c => {
        adj[c.from].add(c.to);
    });

    // Convert sets to arrays
    const graph = {};
    Object.keys(adj).forEach(k => graph[k] = Array.from(adj[k]));

    return graph;
};

/**
 * Detects cycles in a directed graph using DFS.
 */
export const detectCycle = (graph) => {
    const visited = {};
    const recStack = {};
    const nodes = Object.keys(graph);

    nodes.forEach(n => {
        visited[n] = false;
        recStack[n] = false;
    });

    const isCyclicUtil = (v) => {
        if (!visited[v]) {
            visited[v] = true;
            recStack[v] = true;

            const neighbors = graph[v] || [];
            for (let neighbor of neighbors) {
                if (!visited[neighbor] && isCyclicUtil(neighbor)) {
                    return true;
                } else if (recStack[neighbor]) {
                    return true;
                }
            }
        }
        recStack[v] = false;
        return false;
    };

    for (let node of nodes) {
        if (isCyclicUtil(node)) return true;
    }

    return false;
};
