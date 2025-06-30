// utils/sendMessage.ts
export const sendMessage = async (data: {
  to: string;
  subject: string;
  text1: string;
  text2: string;
}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_MAILER_API_URL}/verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};