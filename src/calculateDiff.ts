interface ReviewComment {
    path: string;
    position: number;
    body: string;
}

interface DiffPosition {
    position: number;
    type: 'add' | 'remove' | 'context';
    line: string;
}

export function calculateDiffPositions(diff: string, comments: ReviewComment[]): ReviewComment[] {
    if (!diff || !comments.length) {
        return [];
    }

    const lines = diff.split('\n');
    let position = 0;
    const validComments: ReviewComment[] = [];
    const processedPositions = new Set<number>();
    const diffPositions: DiffPosition[] = [];
    let isInDiffSection = false;

    // Bygg först upp en mappning av positioner till radtyper
    for (const line of lines) {
        if (!line.trim()) continue;

        if (line.startsWith('diff --git') || line.startsWith('index ')) {
            isInDiffSection = true;
            continue;
        }

        if (line.startsWith('---') || line.startsWith('+++')) {
            continue;
        }

        // Hoppa över hunk-huvuden
        if (line.startsWith('@@')) {
            continue;
        }

        if (isInDiffSection) {
            if (line.startsWith('+')) {
                diffPositions.push({ position: position, type: 'add', line });
                position++;
            } else if (line.startsWith('-')) {
                diffPositions.push({ position: position, type: 'remove', line });
                position++;  // Nu ökar vi position även för borttagna rader
            } else {
                diffPositions.push({ position: position, type: 'context', line });
                position++;
            }
        }
    }

    // Matcha kommentarer med rätt position och side
    for (const comment of comments) {
        if (!processedPositions.has(comment.position)) {
            const diffPosition = diffPositions.find(dp => dp.position === comment.position);
            if (diffPosition) {
                const updatedComment = {
                    ...comment,
                    side: diffPosition.type === 'remove' ? 'LEFT' : 'RIGHT'
                };
                validComments.push(updatedComment);
                processedPositions.add(comment.position);
            }
        }
    }

    return validComments;
}

// Hjälpfunktion för att validera diff-format
export function isValidDiff(diff: string): boolean {
    if (!diff) return false;

    const lines = diff.split('\n');
    return lines.some(line =>
        line.startsWith('diff --git') ||
        line.startsWith('+') ||
        line.startsWith('-')
    );
}