/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;

        if (width > height) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
        } else {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
        }

        // If still larger, adjust again
        if (height > maxHeight) {
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
        }
        if (width > maxWidth) {
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
        }
    }

    return { width, height };
}

/**
 * Convert canvas to File
 */
async function canvasToFile(
    canvas: HTMLCanvasElement,
    fileName: string,
    quality: number
): Promise<File> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Failed to create blob'));
                    return;
                }

                const resizedFile = new File([blob], fileName, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });

                resolve(resizedFile);
            },
            'image/jpeg',
            quality
        );
    });
}

/**
 * Load image from file
 */
async function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));

            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Resize an image file to specified dimensions while maintaining aspect ratio
 * @param file - The original image file
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - JPEG quality (0-1), default 0.85
 * @returns Promise<File> - Resized image file
 */
export async function resizeImage(
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.95
): Promise<File> {
    const img = await loadImage(file);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    const { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    return canvasToFile(canvas, file.name, quality);
}
