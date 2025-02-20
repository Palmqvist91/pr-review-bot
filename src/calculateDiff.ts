interface ReviewComment {
    path: string;
    position: number;
    body: string;
}

interface DiffPosition {
    position: number;
    type: 'add' | 'remove' | 'context';
}

export function calculateDiffPositions(diff: string, comments: ReviewComment[]): ReviewComment[] {
    if (!diff || !comments.length) {
        return [];
    }

    const lines = diff.split('\n');
    let position = 0;
    const validComments: ReviewComment[] = [];
    const processedPositions = new Set<number>();

    // Håller reda på om vi är i en diff-sektion
    let isInDiffSection = false;

    for (const line of lines) {
        // Hoppa över tomma rader
        if (!line.trim()) {
            continue;
        }

        // Kontrollera om vi är i en ny diff-sektion
        if (line.startsWith('diff --git') || line.startsWith('index ')) {
            isInDiffSection = true;
            continue;
        }

        // Hoppa över metadata-rader
        if (line.startsWith('---') || line.startsWith('+++')) {
            continue;
        }

        // Hantera kommentarer för nuvarande position
        if (!processedPositions.has(position)) {
            const commentsForPosition = comments.filter(c => c.position === position);
            if (commentsForPosition.length > 0) {
                validComments.push(...commentsForPosition);
                processedPositions.add(position);
            }
        }

        // Uppdatera position baserat på radtyp
        if (isInDiffSection) {
            if (line.startsWith('+')) {
                position++;
            } else if (line.startsWith('-')) {
                // Borttagna rader påverkar inte position
                continue;
            } else {
                // Kontextrader (utan prefix) räknas också
                position++;
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