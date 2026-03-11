import Counter from '@/models/Counter';
import dbConnect from './mongodb';

export async function generateCustomId(prefix: string, counterName: string) {
  await dbConnect();

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const counter = await Counter.findOneAndUpdate(
    { _id: counterName },
    [
      {
        $set: {
          seq: {
            $cond: [{ $eq: ['$date', today] }, { $add: ['$seq', 1] }, 1],
          },
          date: today,
        },
      },
    ],
    {
      new: true,
      upsert: true,
    }
  );

  const number = String(counter.seq).padStart(3, '0');

  return `${prefix}-${today}-${number}`;
}
