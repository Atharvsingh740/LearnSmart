import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TransactionStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'REFUNDED';
export type SubscriptionTier = 'monthly' | 'yearly';

export interface Transaction {
  transactionId: string;
  userId: string;
  subscriptionTier: SubscriptionTier;
  amount: number;
  phoneNumber: string;
  submittedAt: string;
  status: TransactionStatus;
  adminNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  referenceId: string;
}

export interface PaymentState {
  transactions: Transaction[];
  paymentHistory: Transaction[];

  // Actions
  submitPaymentVerification: (
    userId: string,
    tier: SubscriptionTier,
    txnId: string,
    phone: string,
    amount: number
  ) => Promise<string>;
  getPendingTransactions: () => Transaction[];
  getTransactionStatus: (txnId: string) => TransactionStatus | null;
  markTransactionAsVerified: (txnId: string, verifiedBy: string) => void;
  rejectTransaction: (txnId: string, reason: string, rejectedBy: string) => void;
  refundTransaction: (txnId: string, reason: string, refundedBy: string) => void;
  getPaymentHistory: (userId: string) => Transaction[];
  getTransactionById: (txnId: string) => Transaction | undefined;
  isDuplicateTransaction: (txnId: string, phone: string) => boolean;
}

const UPI_ID = 'devyani0131@okaxis';
const PAYEE_NAME = 'LearnSmart (Prachi Singh)';

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      transactions: [],
      paymentHistory: [],

      submitPaymentVerification: async (
        userId: string,
        tier: SubscriptionTier,
        txnId: string,
        phone: string,
        amount: number
      ) => {
        // Check for duplicate submissions within 30 seconds
        if (get().isDuplicateTransaction(txnId, phone)) {
          throw new Error('Duplicate transaction submission. Please wait 30 seconds before resubmitting.');
        }

        // Validate transaction ID format (12-18 alphanumeric characters)
        const txnIdRegex = /^[a-zA-Z0-9]{12,18}$/;
        if (!txnIdRegex.test(txnId)) {
          throw new Error('Invalid Transaction ID format. Should be 12-18 alphanumeric characters.');
        }

        // Validate phone number (exactly 10 digits)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
          throw new Error('Invalid phone number. Must be exactly 10 digits.');
        }

        // Generate unique reference ID
        const referenceId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const transaction: Transaction = {
          transactionId: txnId,
          userId,
          subscriptionTier: tier,
          amount,
          phoneNumber: phone,
          submittedAt: new Date().toISOString(),
          status: 'PENDING_VERIFICATION',
          referenceId,
        };

        set((state) => ({
          transactions: [...state.transactions, transaction],
          paymentHistory: [...state.paymentHistory, transaction],
        }));

        return referenceId;
      },

      getPendingTransactions: () => {
        return get().transactions.filter(t => t.status === 'PENDING_VERIFICATION');
      },

      getTransactionStatus: (txnId: string) => {
        const transaction = get().transactions.find(t => t.transactionId === txnId);
        return transaction ? transaction.status : null;
      },

      markTransactionAsVerified: (txnId: string, verifiedBy: string) => {
        const now = new Date().toISOString();
        set((state) => ({
          transactions: state.transactions.map(t =>
            t.transactionId === txnId
              ? { ...t, status: 'VERIFIED', verifiedAt: now, verifiedBy }
              : t
          ),
          paymentHistory: state.paymentHistory.map(t =>
            t.transactionId === txnId
              ? { ...t, status: 'VERIFIED', verifiedAt: now, verifiedBy }
              : t
          ),
        }));
      },

      rejectTransaction: (txnId: string, reason: string, rejectedBy: string) => {
        const now = new Date().toISOString();
        set((state) => ({
          transactions: state.transactions.map(t =>
            t.transactionId === txnId
              ? { ...t, status: 'REJECTED', adminNotes: reason, verifiedAt: now, verifiedBy: rejectedBy }
              : t
          ),
          paymentHistory: state.paymentHistory.map(t =>
            t.transactionId === txnId
              ? { ...t, status: 'REJECTED', adminNotes: reason, verifiedAt: now, verifiedBy: rejectedBy }
              : t
          ),
        }));
      },

      refundTransaction: (txnId: string, reason: string, refundedBy: string) => {
        const now = new Date().toISOString();
        set((state) => ({
          transactions: state.transactions.map(t =>
            t.transactionId === txnId
              ? { ...t, status: 'REFUNDED', adminNotes: reason, verifiedAt: now, verifiedBy: refundedBy }
              : t
          ),
          paymentHistory: state.paymentHistory.map(t =>
            t.transactionId === txnId
              ? { ...t, status: 'REFUNDED', adminNotes: reason, verifiedAt: now, verifiedBy: refundedBy }
              : t
          ),
        }));
      },

      getPaymentHistory: (userId: string) => {
        return get().paymentHistory.filter(t => t.userId === userId);
      },

      getTransactionById: (txnId: string) => {
        return get().transactions.find(t => t.transactionId === txnId) ||
               get().paymentHistory.find(t => t.transactionId === txnId);
      },

      isDuplicateTransaction: (txnId: string, phone: string) => {
        const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
        return get().transactions.some(
          t => t.transactionId === txnId ||
               (t.phoneNumber === phone && t.submittedAt > thirtySecondsAgo)
        );
      },
    }),
    {
      name: 'learnsmart-payments',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// UPI Payment URL Generator
export const generateUPIQRData = (amount: number, transactionId: string): string => {
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amount}&tn=${encodeURIComponent(`LearnSmart Subscription ${transactionId}`)}&tr=${transactionId}`;
  return upiLink;
};

// Export constants for UI
export { UPI_ID, PAYEE_NAME };