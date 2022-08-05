import { createWriteStream } from "fs";
import PdfDocument, { widthOfString } from "pdfkit";

const pdf = new PdfDocument({ size: "A2", layout: "landscape" });

const lines = [
  {
    text: "@polistirex it's almost like the existing custom is better than whatever shit they try to cook up",
    token: "the",
  },
  {
    text: "it’s such a tragedy to stay inside on peaceful summer days.",
    token: "tragedy",
  },
  {
    text: "The benefits of lifting are immeasurable, but the number one thing is what it does for your mental. Missing a lift sucks ass!",
    token: "of",
  },
  { text: "Chicken Plant fire in Hamlet NC.", token: "hamlet" },
  {
    text: "@jemelehill I also saw @prince in 2004 in Sacramento. His acoustic concert was amazing and was floored when he took requests and bodied them!",
    token: "prince",
  },
  {
    text: "@bindelj Highly annoying but could be worse. Chomping of crisps coupled with loud mobile phone conversations with everyone complaining about being delayed would be intolerable.",
    token: "of",
  },
  {
    text: "Agreed!  Would love for experts to stop saying individual choices don’t matter! You don’t hear that in more advanced climate fighting culture like Denmark or Sweden!",
    token: "denmark",
  },
];

pdf.fontSize(40);
lines.forEach((line, i) => {
  const { text, token } = line;
  const tokenStartIndex = text.toLowerCase().indexOf(token.toLowerCase());
  const tokenEndIndex = tokenStartIndex + token.length;
  const textLeft = text.substring(0, tokenStartIndex);
  const textCenter = text.substring(tokenStartIndex, tokenEndIndex);
  const textRight = text.substring(tokenEndIndex);

  const textLeftWidth = pdf.widthOfString(textLeft, { lineBreak: false });
  const center = pdf.page.width / 2;

  pdf
    .font("Helvetica")
    .text(textLeft, center - textLeftWidth, 20 + i * 60, {
      lineBreak: false,
      continued: true,
    })
    .font("Helvetica-Bold")
    .text(textCenter, { lineBreak: false, continued: true })
    .font("Helvetica")
    .text(textRight, { lineBreak: false });
});

const rectWidth = 250;

const gradientLeft = pdf.linearGradient(
  0,
  pdf.page.height / 2,
  rectWidth,
  pdf.page.height / 2
);
gradientLeft.stop(0, "white", 1).stop(1, "white", 0);
pdf.rect(0, 0, rectWidth, pdf.page.height);
pdf.fill(gradientLeft);

const gradientRight = pdf.linearGradient(
  pdf.page.width - rectWidth,
  pdf.page.height / 2,
  pdf.page.width,
  pdf.page.height / 2
);
gradientRight.stop(0, "white", 0).stop(1, "white", 1);
pdf.rect(pdf.page.width - rectWidth, 0, rectWidth, pdf.page.height);
pdf.fill(gradientRight);

pdf.pipe(createWriteStream("out.pdf"));
pdf.end();
