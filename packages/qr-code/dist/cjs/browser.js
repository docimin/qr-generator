"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApiUrl = buildApiUrl;
exports.fetchQrcodeFromApi = fetchQrcodeFromApi;
// This file provides a thin client that defers to the server package or a hosted API.
// In browsers/React/Next.js client components/React Native, you should:
// - call your server endpoint, or
// - import the Node entry in server components or API routes.
function buildApiUrl(baseUrl, params) {
    const usp = new URLSearchParams(params);
    return `${baseUrl}?${usp.toString()}`;
}
async function fetchQrcodeFromApi(baseUrl = 'https://qr-generator.dev/api/qrcode', options) {
    const { value, size, margin, errorCorrectionLevel, colorMode, foregroundColor, backgroundColor, gradientStart, gradientEnd, gradientDirection, centerImageUrl, overlayBackground, overlayRadius, overlayScale, format = 'png', } = options;
    const params = { value, format };
    if (size)
        params.size = String(size);
    if (margin !== undefined)
        params.margin = String(margin);
    if (errorCorrectionLevel)
        params.errorCorrectionLevel = errorCorrectionLevel;
    if (colorMode)
        params.colorMode = colorMode;
    if (foregroundColor)
        params.foregroundColor = foregroundColor;
    if (backgroundColor)
        params.backgroundColor = backgroundColor;
    if (gradientStart)
        params.gradientStart = gradientStart;
    if (gradientEnd)
        params.gradientEnd = gradientEnd;
    if (gradientDirection)
        params.gradientDirection = gradientDirection;
    if (centerImageUrl)
        params.centerImageUrl = centerImageUrl;
    if (overlayBackground)
        params.overlayBackground = overlayBackground;
    if (overlayRadius !== undefined)
        params.overlayRadius = String(overlayRadius);
    if (overlayScale !== undefined)
        params.overlayScale = String(overlayScale);
    const url = buildApiUrl(baseUrl, params);
    const res = await fetch(url);
    if (!res.ok) {
        try {
            const j = await res.json();
            throw new Error(j?.error ?? `Request failed: ${res.status}`);
        }
        catch {
            throw new Error(`Request failed: ${res.status}`);
        }
    }
    const blob = await res.blob();
    const buf = await blob.arrayBuffer();
    const base64 = typeof Buffer !== 'undefined'
        ? Buffer.from(buf).toString('base64')
        : btoa(String.fromCharCode(...new Uint8Array(buf)));
    return { kind: 'blob', data: `data:image/png;base64,${base64}` };
}
