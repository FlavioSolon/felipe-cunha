export async function resizeAndCropImage(
    file: File,
    targetWidth: number = 414,
    targetHeight: number = 517.5
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            // Calculate crop dimensions (center crop)
            const targetRatio = targetWidth / targetHeight;
            const imgRatio = img.width / img.height;

            let sourceWidth, sourceHeight, sourceX, sourceY;

            if (imgRatio > targetRatio) {
                // Image is wider - crop sides
                sourceHeight = img.height;
                sourceWidth = img.height * targetRatio;
                sourceX = (img.width - sourceWidth) / 2;
                sourceY = 0;
            } else {
                // Image is taller - crop top/bottom
                sourceWidth = img.width;
                sourceHeight = img.width / targetRatio;
                sourceX = 0;
                sourceY = (img.height - sourceHeight) / 2;
            }

            // Create canvas and draw cropped image
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // High quality scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.drawImage(
                img,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                targetWidth,
                targetHeight
            );

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                },
                'image/jpeg',
                0.95 // High quality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}
