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
    Previews?: PDFPreview[]
    TotalCount: number;
}

export interface HomeData {
    RecentlyViewed?: PDFPreview[]
    RecentlyUploaded?: PDFPreview[]
    Folders?: string[]
}