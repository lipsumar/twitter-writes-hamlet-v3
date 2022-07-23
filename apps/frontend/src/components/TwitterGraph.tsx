import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./twitter-graph.css";
import moment from "moment";
import { useQuery } from "react-query";
import invariant from "tiny-invariant";

// const series = [
//   {
//     name: "Series 1",
//     data: [
//       { value: 14, time: 1503617297689 },
//       { value: 15, time: 1503616962277 },
//       { value: 15, time: 1503616882654 },
//       { value: 20, time: 1503613184594 },
//       { value: 15, time: 1503611308914 },
//     ],
//   },
//   {
//     name: "Series 2",
//     data: [
//       { value: 10, time: 1503616962277 },
//       { value: 10, time: 1503613184594 },
//     ],
//   },
//   // {
//   //   name: "Series 2",
//   //   data: [
//   //     { category: "B", value: Math.random() },
//   //     { category: "C", value: Math.random() },
//   //     { category: "D", value: Math.random() },
//   //   ],
//   // },
//   // {
//   //   name: "Series 3",
//   //   data: [
//   //     { category: "C", value: Math.random() },
//   //     { category: "D", value: Math.random() },
//   //     { category: "E", value: Math.random() },
//   //   ],
//   // },
// ];

export default function TwitterGraph() {
  const { data: series, isLoading } = useQuery("logs", () => {
    return fetch("http://localhost:5000/logs")
      .then((resp) => resp.json())
      .then((logs) => {
        return [
          {
            name: "rate-limit",
            data: logs
              .filter((l: any) => l.message === "search-result")
              .map((l: any) => ({
                time: moment(l.created_at).format("X"),
                value: l.data.rateLimitRemaining,
              })),
          },
        ];
      });
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  invariant(!!series);
  console.log(series);
  return (
    <div className="twitter-graph">
      hey
      <ResponsiveContainer width="100%" height="100%">
        <LineChart width={500} height={300}>
          <CartesianGrid strokeDasharray="3 3" />
          {/* <XAxis
            dataKey="category"
            type="category"
            allowDuplicatedCategory={false}
          /> */}
          <XAxis
            dataKey="time"
            domain={["auto", "auto"]}
            tickFormatter={(unixTime) =>
              moment.unix(unixTime).format("MMM DD HH:mm YYYY")
            }
            type="number"
          />
          <YAxis dataKey="value" />
          <Tooltip />
          <Legend />

          <Line
            dataKey="value"
            data={series[0].data}
            name="rate-limit"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
