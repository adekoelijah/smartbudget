import Transaction from "../../models/Transaction.js";
import { Transform } from "stream";
import { stringify } from "csv-stringify";

export const streamCSV = async (req, res) => {
  const userId = req.user.id;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");

  const stringifier = stringify({
    header: true,
    columns: ["title", "amount", "type", "category", "createdAt"],
  });

  const transformStream = new Transform({
    objectMode: true,
    transform(chunk, _, cb) {
      cb(null, chunk);
    },
  });

  const cursor = Transaction.find({ user: userId }).cursor();

  for await (const doc of cursor) {
    stringifier.write(doc);
  }

  stringifier.pipe(res);
};