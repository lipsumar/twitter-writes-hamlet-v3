import { Entry, LiveTextContent } from "types";
import HamletTextContent from "./HamletTextContent";

type HamletEntryProps = {
  entry: Entry<LiveTextContent>;
};
export default function HamletEntry({ entry }: HamletEntryProps) {
  return (
    <div className={`entry entry--${entry.type}`}>
      {"name" in entry ? (
        <div>
          <HamletTextContent as="span" textContent={entry.name} />
          {entry.direction ? (
            <HamletTextContent as="span" textContent={entry.direction} />
          ) : null}
        </div>
      ) : null}
      <HamletTextContent textContent={entry.text} />
    </div>
  );
}
