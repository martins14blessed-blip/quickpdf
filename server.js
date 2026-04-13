const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

/* =========================
   IMAGE → PDF
========================= */
app.post("/img-to-pdf", upload.array("files"), async (req, res) => {
  const pdfDoc = await PDFDocument.create();

  for (let file of req.files) {
    const imgBytes = fs.readFileSync(file.path);

    let img;
    if (file.mimetype.includes("png")) {
      img = await pdfDoc.embedPng(imgBytes);
    } else {
      img = await pdfDoc.embedJpg(imgBytes);
    }

    const page = pdfDoc.addPage([600, 800]);
    page.drawImage(img, {
      x: 50,
      y: 100,
      width: 500,
      height: 600
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("output/result.pdf", pdfBytes);

  res.download("output/result.pdf");
});


/* =========================
   MERGE PDF
========================= */
app.post("/merge", upload.array("files"), async (req, res) => {
  const mergedPdf = await PDFDocument.create();

  for (let file of req.files) {
    const pdfBytes = fs.readFileSync(file.path);
    const pdf = await PDFDocument.load(pdfBytes);

    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(p => mergedPdf.addPage(p));
  }

  const finalPdf = await mergedPdf.save();
  fs.writeFileSync("output/merged.pdf", finalPdf);

  res.download("output/merged.pdf");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("QuickPDF running...");
});