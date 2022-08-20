import "env";
import { db } from "database";
import { createWriteStream } from "fs";
import PdfDocument, { off } from "pdfkit";
import { decode } from "html-entities";
import japaneseCharacters from "japanese-characters";
import { isOneEmoji } from "is-emojis";
import runes from "runes";
import doc from "pdfkit";
const pdf = new PdfDocument({ size: "A2", layout: "landscape" });

async function getWordAndTweet(index: number) {
  const rows = await db("words")
    .join("tweets", "words.tweet_id", "=", "tweets.id")
    .select("tweets.tweet_text", "words.token", "words.alternative")
    .where({ "words.id": index })
    .limit(1);
  return rows[0];
}

// https://stackoverflow.com/questions/6787716/regular-expression-for-japanese-characters
function isJap(char: string): boolean {
  return /[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[ａ-ｚＡ-Ｚ０-９]+|[〜！々〆〤ヶ]+/u.test(
    char
  );
}

function getCleanText(text: string) {
  return decode(
    text
      .trim()
      //@ts-ignore
      .replaceAll(/\n/g, "")
      .replace(/https:\/\/t.co\/[a-zA-Z0-9-_]+$/, "")
  );
}

function getChars(text: string, token: string, altToken: string) {
  const cleanText = getCleanText(text);
  const words = cleanText.split(/[ -;:/,.]/); //runes(cleanText);

  const tok = cleanText.toLowerCase().includes(token.toLowerCase())
    ? token
    : altToken;

  // const wordStartAt = cleanText.toLowerCase().indexOf(tok.toLowerCase());
  // const wordEndAt = wordStartAt + tok.length;
  const tokenIndex = words
    .map((w) => w.toLowerCase())
    .indexOf(tok.toLowerCase());
  return words.map((word, i) => {
    let lang = undefined;
    if (word === "！") {
      word = "!";
    }
    if (isJap(word)) {
      lang = "jap";
    }
    if (isOneEmoji(word)) {
      lang = "emoji";
    }
    let isToken = false;

    return {
      word,
      lang,
      isToken: tokenIndex === i, //i >= wordStartAt && i < wordEndAt,
      //isBeforeToken: i + 1 === wordStartAt,
    };
  });
}

// getWordAndTweet(5)
//   .then((row) => {
//     console.log(row);
//     console.log(getChars(row.tweet_text));
//   })
//   .finally(() => {
//     db.destroy();
//   });

const fonts: Record<string, string> = {
  roman: "fonts/Noto_Sans/NotoSans-Regular.ttf",
  roman_bold: "fonts/Noto_Sans/NotoSans-Bold.ttf",
  jap: "fonts/Noto_Sans_JP/NotoSansJP-Regular.otf",
  emoji: "fonts/TwitterColorEmoji-SVGinOT.ttf",
};
pdf.font(fonts.roman).fontSize(16).lineGap(1);
(async () => {
  let y = 20;
  let x = 10;
  let baseX = 0;
  for (let i = 0; i < 49; i++) {
    const row = await getWordAndTweet(13461 + i);

    console.log(row.tweet_text);
    const chars = getChars(row.tweet_text, row.token, row.alternative);

    // let isFirstOfToken = false;
    // let resetIsFirstOfToken = false;

    chars.forEach((char) => {
      let font = fonts[char.lang || "roman"];
      if (char.isToken) {
        font = fonts.roman_bold;
      }
      // if (isFirstOfToken) {
      //   isFirstOfToken = false;
      //   resetIsFirstOfToken = true;
      // }
      // if (char.isToken && !isFirstOfToken && !resetIsFirstOfToken) {
      //   isFirstOfToken = true;
      // }

      //if (char.lang === "emoji") return;
      //const ch = char.char === "\ud83d" ? "😂" : char;

      let textSize = 22;
      let prevWasToken = false;
      if (char.isToken) {
        while (true) {
          const textWidth = pdf
            .font(font)
            .fontSize(textSize)
            .widthOfString(char.word);
          console.log(char.word, textWidth);
          if (textWidth < 200) {
            textSize += 1;
          } else {
            break;
          }
        }

        //pdf.fontSize(16).text("\n");
      }

      const fontSize = char.isToken ? Math.min(textSize, 80) : 12;
      const textWidth = pdf
        .font(font)
        .fontSize(fontSize)
        .widthOfString(char.word + " ");
      const textHeight = pdf
        .font(font)
        .fontSize(fontSize)
        .heightOfString(char.word);

      if (char.isToken) {
        x = baseX + 10;
        y += textHeight / 1.65;
      }

      pdf
        .font(font)
        .fontSize(fontSize)

        .text(
          char.word,
          // (char.isToken ? "\n" : "") + char.word + (char.isToken ? "\n" : " "),
          x,
          y,
          {
            //continued: !char.isToken,
            baseline: "alphabetic",
            //  columns: 5,
            width: 210,
          }
        );

      if (char.isToken) {
        //pdf.fontSize(16).text("\n");
        pdf.lineGap(1);
        prevWasToken = true;
        //x = baseX + 10;
      }

      x += textWidth;
      if (x > baseX + 210) {
        x = baseX + 10;
        y += 16;
      }
      if (y > 900) {
        y = 20;
        baseX += 240;
      }
      if (baseX > 1000) {
        baseX = 0;
        x = 10;
        y = 20;
        pdf.addPage();
      }
    });
  }

  pdf.pipe(createWriteStream(__dirname + "/out.pdf"));
  pdf.end();

  db.destroy();
})();
