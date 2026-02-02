import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Chat from "@/components/Chat";

export const dynamic = "force-dynamic";

export default async function Page() {
  await connectDB();
  
  // Fetch the latest 50 messages from MongoDB
  const initialMessages = await Message.find()
    .sort({ createdAt: 1 })
    .limit(50)
    .lean();

  // Serialize MongoDB objects (transform _id and Dates to strings)
  const serializedMessages = initialMessages.map((msg) => ({
    _id: String(msg._id),
    user: msg.user,
    text: msg.text,
    createdAt: msg.createdAt.toISOString(),
  }));

  return (
    <main>
      <Chat initialMessages={serializedMessages} />
    </main>
  );
}
