import QRCode from 'qrcode';
import { UPI_ID, PAYEE_NAME } from '@/store/paymentStore';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export const generateUPIQRData = (amount: number, transactionId: string): string => {
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&tn=${encodeURIComponent(`LearnSmart Subscription - ${transactionId}`)}&tr=${transactionId}`;
  return upiLink;
};

export const generateQRCodeDataURL = async (
  amount: number,
  transactionId: string,
  options: QRCodeOptions = {}
): Promise<string> => {
  try {
    const upiData = generateUPIQRData(amount, transactionId);
    
    const qrOptions = {
      width: options.width || 250,
      margin: options.margin || 1,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
      errorCorrectionLevel: 'M' as const,
    };

    const dataUrl = await QRCode.toDataURL(upiData, qrOptions);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const validateTransactionId = (txnId: string): boolean => {
  const txnIdRegex = /^[a-zA-Z0-9]{12,18}$/;
  return txnIdRegex.test(txnId);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

export const formatAmount = (amount: number): string => {
  return `₹${amount}`;
};

export const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};