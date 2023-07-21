export interface PDF {
    Uuid?: string;
    Title?: string;
    Author?: string;
    Tags?: string[];
    Image?: string;
    Size?: number;
    NumPages?: number;
    UploadDate?: string;
    CreationDate?: string;
    Filename?: string;
    Folder: string | null;
}

export interface PDFFile {
    File?: string;
}