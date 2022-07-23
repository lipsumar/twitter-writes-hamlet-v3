import { useQuery } from "react-query";
import { LiveTextContent, TitleEntry } from "types";
import HamletEntry from "../components/HamletEntry/HamletEntry";
import HamletText from "../components/HamletEntry/HamletText";
/*
const entry: TitleEntry<LiveTextContent> = {
  type: "title",
  titleType: "title",
  text: {
    raw: "The Tragedy of Hamlet, Prince of Denmark",
    words: [
      {
        token: "The",
        index: 1,
        tweetId: "1",
      },
      {
        token: "Tragedy",
        index: 2,
        tweetId: "2",
      },
      {
        token: "of",
        index: 3,
        tweetId: "x",
      },
      {
        token: "Hamlet",
        index: 4,
        tweetId: "df",
      },
      {
        token: "Prince",
        index: 5,
      },
      {
        token: "of",
        index: 6,
      },
      {
        token: "Denmark",
        index: 7,
      },
    ],
  },
  index: 1,
};
*/
export default function HomePage() {
  const { data: initialPayload, isLoading } = useQuery("initialPayload", () => {
    return fetch("http://localhost:5000/init").then((resp) => resp.json());
  });
  return (
    <div className="container">
      <h1>Twitter Writes Hamlet</h1>
      <hr />
      <br />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <HamletText initialEntries={initialPayload.entries} />
      )}
    </div>
  );
}
