//TODO: Move this to a util file

interface ReviewComment {
    path: string;
    position: number;
    body: string;
}


export function calculateDiffPositions(diff: string, comments: ReviewComment[]): ReviewComment[] {
    const lines = diff.split('\n');
    let position = 0;
    const validComments: ReviewComment[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const commentsForPosition = comments.filter(c => c.position === position);
        if (commentsForPosition.length > 0) {
            validComments.push(...commentsForPosition);
        }

        if (line.startsWith('+') && !line.startsWith('+++')) {
            position++;
        } else if (!line.startsWith('-')) {
            position++;
        }
    }

    return validComments;
}