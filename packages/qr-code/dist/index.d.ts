export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type ColorMode = 'solid' | 'gradient';
export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up';
export type GenerateOptions = {
    value: string;
    size?: number;
    margin?: number;
    errorCorrectionLevel?: ErrorCorrectionLevel;
    colorMode?: ColorMode;
    foregroundColor?: string;
    backgroundColor?: string;
    gradientStart?: string;
    gradientEnd?: string;
    gradientDirection?: GradientDirection;
    centerImageBuffer?: Buffer | null;
    centerImageUrl?: string | null;
    overlayBackground?: string;
    overlayRadius?: number;
    overlayScale?: number;
};
export declare function generatePngBuffer(opts: GenerateOptions): Promise<Buffer>;
export declare function generatePngDataUrl(opts: GenerateOptions): Promise<string>;
declare const _default: {
    generatePngBuffer: typeof generatePngBuffer;
    generatePngDataUrl: typeof generatePngDataUrl;
};
export default _default;
export type ContentInput = {
    type: 'raw';
    value: string;
} | {
    type: 'text';
    text: string;
} | {
    type: 'url';
    url: string;
} | {
    type: 'email';
    email: string;
    subject?: string;
    body?: string;
} | {
    type: 'contact';
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    organization?: string;
};
export declare function buildContent(input: ContentInput): string;
export type GenerateBase64Options = Omit<GenerateOptions, 'value'> & {
    content: ContentInput;
};
export declare function generateBase64FromContent(opts: GenerateBase64Options): Promise<string>;
export declare function generateBase64(opts: GenerateOptions): Promise<string>;
