export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type ColorMode = 'solid' | 'gradient';
export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up';
export type GenerateClientOptions = {
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
    centerImageUrl?: string | null;
    overlayBackground?: string;
    overlayRadius?: number;
    overlayScale?: number;
    format?: 'png' | 'blob';
};
export declare const DEFAULT_API_URL = "https://qr-generator.dev/api/qrcode";
export declare function buildApiUrl(baseUrl: string, params: Record<string, string>): string;
export declare function fetchQrcodeFromApi(baseUrlOrUndefined: string | undefined, options: GenerateClientOptions): Promise<{
    kind: 'blob';
    data: string;
}>;
