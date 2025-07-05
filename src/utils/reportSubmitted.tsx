// utils/sendMessage.ts
export const reportSubmitted = async (data: {
  to: string;
  reportedEntity: string;
  supportUrl: string;
  reportId: string;
}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_MAILER_API_URL}/submit-report`, {
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