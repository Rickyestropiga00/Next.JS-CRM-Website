import Counter from '@/models/Counter';
import dbConnect from './mongodb';

export async function generateCustomId(
  counterName: string,
  format: (seq: number) => string,
  initialSeq: number = 0
): Promise<string> {
  await dbConnect();

  // If the counter's current seq is below initialSeq (or doesn't exist yet),
  // jump straight to initialSeq + 1 so new IDs never collide with static mock data.
  const counter = await Counter.findOneAndUpdate(
    { _id: counterName },
    [
      {
        $set: {
          seq: {
            $cond: {
              if: { $lt: [{ $ifNull: ['$seq', 0] }, initialSeq] },
              then: initialSeq + 1,
              else: { $add: ['$seq', 1] },
            },
          },
        },
      },
    ],
    { new: true, upsert: true }
  );

  return format(counter.seq);
}
