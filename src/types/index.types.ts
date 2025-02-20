export interface ReviewComment {
    path: string;
    position: number;
    body: string;
}

export interface ReviewFeedback {
    inlineComments: ReviewComment[];
}

export interface ReviewComment {
    path: string;
    position: number;
    body: string;
    side?: 'LEFT' | 'RIGHT';
}

export interface DiffPosition {
    position: number;
    type: 'add' | 'remove' | 'context';
    line: string;
    originalLine?: number;
    newLine?: number;
}