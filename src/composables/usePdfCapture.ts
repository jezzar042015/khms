import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function usePdfCapture() {
    const captureAsPdf = async (
        element: HTMLElement | null,
        filename: string = "document.pdf"
    ): Promise<void> => {
        if (!element) {
            console.error("usePdfCapture: element is null or undefined.");
            return;
        }

        // Convert the element to canvas
        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2,
        });

        const imgData: string = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
            orientation: "p",
            unit: "pt",
            format: "a4",
        });

        const pageWidth: number = pdf.internal.pageSize.getWidth();
        const pageHeight: number = pdf.internal.pageSize.getHeight();

        const imgWidth: number = pageWidth;
        const imgHeight: number = (canvas.height * pageWidth) / canvas.width;

        let heightLeft: number = imgHeight;
        let position: number = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Open PDF in new tab
        const blobUrl = pdf.output("bloburl");
        window.open(blobUrl, "_blank");

        // Optional: force download
        // pdf.save(filename);
    };

    return { captureAsPdf };
}
