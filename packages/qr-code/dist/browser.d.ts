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
};
export declare function buildApiUrl(baseUrl: string, params: Record<string, string>): string;
export declare function fetchQrcodeFromApi(baseUrl: string, options: GenerateClientOptions & {
    format?: 'png' | 'blob';
}): Promise<{
    kind: 'blob';
    data: string;
}>;
