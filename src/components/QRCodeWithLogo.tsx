"use client";

import { useEffect, useRef } from "react";
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
    const qrRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (qrRef.current && canvasRef.current) {
                const canvas = qrRef.current.querySelector("canvas") as HTMLCanvasElement;
                if (!canvas) return;

                // Create a new canvas with the logo
                const ctx = canvasRef.current.getContext("2d");
                if (!ctx) return;

                // Draw the QR code onto the new canvas
                canvasRef.current.width = size;
                canvasRef.current.height = size;
                ctx.drawImage(canvas, 0, 0, size, size);

                // Load and draw the FNB logo
                const img = new Image();
                img.src = "/fnb.svg";
                img.onload = () => {
                    // Draw white background box in the center
                    const bgSize = logoSize + 10;
                    const bgPos = (size - bgSize) / 2;
                    ctx.fillStyle = "white";
                    ctx.fillRect(bgPos, bgPos, bgSize, bgSize);

                    // Draw logo in the center
                    const logoPos = (size - logoSize) / 2;
                    ctx.drawImage(img, logoPos, logoPos, logoSize, logoSize);
                };
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [size, logoSize]);

    return (
        <div>
            {/* Hidden QR code generator */}
            <div ref={qrRef} style={{ display: "none" }}>
                <QRCodeCanvas
                    value={value}
                    size={size}
                    level={level}
                    includeMargin={false}
                />
            </div>
            {/* Visible canvas with logo */}
            <canvas
                ref={canvasRef}
                style={{
                    border: "none",
                    display: "block",
                }}
            />
        </div>
    );
}
