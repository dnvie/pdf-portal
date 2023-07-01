export interface PDFPreview {
    Uuid: string;
    Title: string;
    Author: string;
    Tags: string[];
    Image: string;
    Size: number;
    NumPages: number;
}

export interface PDFPreviews {
    data?: PDFPreview[]
}