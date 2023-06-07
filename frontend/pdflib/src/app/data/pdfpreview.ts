export interface PDFPreview {
    Uuid: string;
    Title: string;
    Author: string;
    Tags: string[];
    Image: string;
}

export interface PDFPreviews {
    data?: PDFPreview[]
}