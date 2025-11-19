import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function usePdfCapture() {
    const captureAsPdf = async (
        element: HTMLElement | null,
        filename = "document.pdf"
    ) => {
        if (!element) {
            console.error("usePdfCapture: element is null or undefined.");
            return;
        }

        // Step 1: Identify all page-break positions
        const pageBreakEls = Array.from(
            element.querySelectorAll(".page-break")
        ) as HTMLElement[];

        const breakPositions = pageBreakEls.map((el) => {
            const rect = el.getBoundingClientRect();
            const parentRect = element.getBoundingClientRect();
            return rect.top - parentRect.top; // relative vertical position inside element
        });

        // Step 2: Render entire component to canvas
        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "pt", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // scaling ratio so width fits perfectly on A4
        const scale = pageWidth / canvas.width;
        const scaledHeight = canvas.height * scale;

        // Step 3: Prepare segments according to page-breaks
        const segments: number[] = [0, ...breakPositions, canvas.height];

        // Step 4: Loop through segments to generate real PDF pages
        for (let i = 0; i < segments.length - 1; i++) {
            const startY = segments[i];
            const endY = segments[i + 1];
            const segmentHeight = endY - startY;

            // temp canvas slice
            const sliceCanvas = document.createElement("canvas");
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = segmentHeight;

            const ctx = sliceCanvas.getContext("2d");
            if (!ctx) continue;

            ctx.drawImage(
                canvas,
                0,
                startY,
                canvas.width,
                segmentHeight,
                0,
                0,
                canvas.width,
                segmentHeight
            );

            // convert the slice to image
            const sliceImg = sliceCanvas.toDataURL("image/png");

            const pdfHeight = (segmentHeight * scale);

            if (i > 0) pdf.addPage();

            pdf.addImage(sliceImg, "PNG", 0, 0, pageWidth, pdfHeight);
        }

        // Step 5: Open in new tab
        const blobUrl = pdf.output("bloburl");
        window.open(blobUrl, "_blank");
    };

    return { captureAsPdf };
}
