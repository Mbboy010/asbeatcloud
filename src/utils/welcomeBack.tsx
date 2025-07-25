// utils/sendMessage.ts
export const welcomeBack = async (data: {
  to: string;
  username: string;
  profileUrl: string;
}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_MAILER_API_URL}/welcome-back`, {
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