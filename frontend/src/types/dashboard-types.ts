export interface CostAnalysis {
    id: string;
    name: string;
    data: CostAnalysisDataPoint[];
}

export interface CostAnalysisDataPoint {
    cost: number;
    date: Date;
}