interface ReviewComment {
    path: string;
    position: number;
    body: string;
    side?: 'LEFT' | 'RIGHT';
}

interface DiffPosition {
    position: number;
    type: 'add' | 'remove' | 'context';
    line: string;
    originalLine?: number;
    newLine?: number;
}

export function calculateDiffPositions(diff: string, comments: ReviewComment[]): ReviewComment[] {
    if (!diff || !comments.length) {
        return [];
    }

    const lines = diff.split('\n');
    let position = 0;
    const validComments: ReviewComment[] = [];
    const processedPositions = new Set<number>();
    const diffPositionsMap = new Map<number, DiffPosition>();
    let isInDiffSection = false;
    let originalLine = 0;
    let newLine = 0;

    for (const line of lines) {
        if (!line.trim()) continue;

        if (line.startsWith('diff --git') || line.startsWith('index ')) {
            isInDiffSection = true;
            continue;
        }

        if (line.startsWith('---') || line.startsWith('+++')) {
            continue;
        }

        if (line.startsWith('@@')) {
            const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
            if (match) {
                originalLine = parseInt(match[1], 10);
                newLine = parseInt(match[2], 10);
            }
            continue;
        }

        if (isInDiffSection) {
            if (line.startsWith('+')) {
                diffPositionsMap.set(position, {
                    position,
                    type: 'add',
                    line,
                    newLine: newLine++
                });
                position++;
            } else if (line.startsWith('-')) {
                diffPositionsMap.set(position, {
                    position,
                    type: 'remove',
                    line,
                    originalLine: originalLine++
                });
                position++;
            } else {
                diffPositionsMap.set(position, {
                    position,
                    type: 'context',
                    line,
                    originalLine: originalLine++,
                    newLine: newLine++
                });
                position++;
            }
        }
    }

    for (const comment of comments) {
        if (!processedPositions.has(comment.position)) {
            const diffPosition = diffPositionsMap.get(comment.position);
            if (diffPosition) {
                validComments.push({
                    ...comment,
                    side: diffPosition.type === 'remove' ? 'LEFT' : 'RIGHT'
                });
                processedPositions.add(comment.position);
            } else {
                console.warn(`Comment position ${comment.position} not found in diff`);
            }
        }
    }

    return validComments;
}

export function isValidDiff(diff: string): boolean {
    if (!diff) return false;

    const lines = diff.split('\n');
    return lines.some(line =>
        line.startsWith('diff --git') ||
        line.startsWith('+') ||
        line.startsWith('-')
    );
}