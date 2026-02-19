'use client';

import { QRCodeSVG } from 'qrcode.react';

export function QRCodeGenerator({ value, size = 200 }: { value: string, size?: number }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
            <QRCodeSVG
                value={value}
                size={size}
                level="H"
                includeMargin={true}
            />
        </div>
    );
}
