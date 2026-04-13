const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("QuickPDF is running 🚀");
});

app.post("/img-to-pdf", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.send("No files uploaded");
    }

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

  } catch (err) {
    console.log(err);
    res.send("Error processing file");
  }
});

app.listen(process.env.PORT || 3000);
