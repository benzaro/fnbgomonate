"use client";

import { QRCodeCanvas } from "qrcode.react";

interface QRCodeWithLogoProps {
    value: string;
    size?: number;
    logoSize?: number;
    level?: "L" | "M" | "Q" | "H";
}

export default function QRCodeWithLogo({
    value,
    size = 200,
    logoSize = 60,
    level = "H",
}: QRCodeWithLogoProps) {
    return (
        <QRCodeCanvas
            value={value}
            size={size}
            level={level}
            includeMargin={false}
        />
    );
}
