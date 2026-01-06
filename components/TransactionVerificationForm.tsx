import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { COLORS } from '@/theme/palette';
import { TYPOGRAPHY } from '@/theme/typography';
import { validateTransactionId, validatePhoneNumber } from '@/utils/qrCodeGenerator';

interface TransactionVerificationFormProps {
  onSubmit: (transactionId: string, phoneNumber: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export const TransactionVerificationForm: React.FC<TransactionVerificationFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [transactionIdTouched, setTransactionIdTouched] = useState(false);
  const [phoneNumberTouched, setPhoneNumberTouched] = useState(false);

  const validateField = (field: 'transactionId' | 'phoneNumber', value: string): string | null => {
    if (!value.trim()) {
      return `${field === 'transactionId' ? 'Transaction ID' : 'Phone Number'} is required`;
    }

    if (field === 'transactionId') {
      if (!validateTransactionId(value)) {
        return 'Transaction ID must be 12-18 alphanumeric characters';
      }
    }

    if (field === 'phoneNumber') {
      if (!validatePhoneNumber(value)) {
        return 'Phone number must be exactly 10 digits';
      }
    }

    return null;
  };

  const handleTransactionIdChange = (text: string) => {
    setTransactionId(text);
    if (transactionIdTouched) {
      const error = validateField('transactionId', text);
      setFieldErrors(prev => ({ ...prev, transactionId: error || '' }));
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleaned);
    if (phoneNumberTouched) {
      const error = validateField('phoneNumber', cleaned);
      setFieldErrors(prev => ({ ...prev, phoneNumber: error || '' }));
    }
  };

  const handleSubmit = async () => {
    const txnIdError = validateField('transactionId', transactionId);
    const phoneError = validateField('phoneNumber', phoneNumber);

    const errors: { [key: string]: string } = {};
    if (txnIdError) errors.transactionId = txnIdError;
    if (phoneError) errors.phoneNumber = phoneError;

    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      await onSubmit(transactionId, phoneNumber);
    }
  };

  const isSubmitDisabled = loading || !transactionId || !phoneNumber || Object.values(fieldErrors).some(err => err);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Verification</Text>
      <Text style={styles.subtitle}>Enter your payment details for manual verification</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>UPI Transaction ID</Text>
        <TextInput
          style={[styles.input, fieldErrors.transactionId ? styles.inputError : null]}
          value={transactionId}
          onChangeText={handleTransactionIdChange}
          onBlur={() => {
            setTransactionIdTouched(true);
            const error = validateField('transactionId', transactionId);
            setFieldErrors(prev => ({ ...prev, transactionId: error || '' }));
          }}
          placeholder="e.g., 2024011512345678"
          placeholderTextColor={COLORS.CHARCOAL_TEXT + '80'}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={18}
        />
        {fieldErrors.transactionId ? (
          <Text style={styles.errorMessage}>{fieldErrors.transactionId}</Text>
        ) : transactionId ? (
          <Text style={styles.successMessage}>✓ Valid Transaction ID</Text>
        ) : null}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Registered Mobile Number</Text>
        <TextInput
          style={[styles.input, fieldErrors.phoneNumber ? styles.inputError : null]}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          onBlur={() => {
            setPhoneNumberTouched(true);
            const error = validateField('phoneNumber', phoneNumber);
            setFieldErrors(prev => ({ ...prev, phoneNumber: error || '' }));
          }}
          placeholder="Enter 10-digit mobile number"
          placeholderTextColor={COLORS.CHARCOAL_TEXT + '80'}
          keyboardType="phone-pad"
          maxLength={10}
        />
        {fieldErrors.phoneNumber ? (
          <Text style={styles.errorMessage}>{fieldErrors.phoneNumber}</Text>
        ) : phoneNumber ? (
          phoneNumber.length === 10 ? (
            <Text style={styles.successMessage}>✓ Valid Phone Number</Text>
          ) : (
            <Text style={styles.helpMessage}>{10 - phoneNumber.length} digits remaining</Text>
          )
        ) : null}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          style={[
            styles.submitButton,
            isSubmitDisabled ? styles.submitButtonDisabled : null,
          ]}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.SAND_BG} />
          ) : (
            <Text style={styles.submitButtonText}>Verify Payment</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCancel}
          disabled={loading}
          style={styles.cancelButton}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>← Back to Plans</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.helpTextContainer}>
        <Text style={styles.helpText}>ℹ️ Admin will verify your payment within 24 hours</Text>
        <Text style={styles.helpText}>You'll receive a notification once verified</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontFamily: TYPOGRAPHY.SECTION_HEADER.fontFamily,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: COLORS.CORAL_ERROR + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.CORAL_ERROR,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.RED_ERROR,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.CHARCOAL_TEXT,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.CREAM_BG,
    borderWidth: 1,
    borderColor: COLORS.SAGE_PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 16,
    color: COLORS.CHARCOAL_TEXT,
  },
  inputError: {
    borderColor: COLORS.CORAL_ERROR,
  },
  errorMessage: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 12,
    color: COLORS.CORAL_ERROR,
    marginTop: 4,
  },
  successMessage: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 12,
    color: COLORS.SAGE_PRIMARY,
    marginTop: 4,
  },
  helpMessage: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 12,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: COLORS.SAGE_PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.SAGE_PRIMARY + '80',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.SAND_BG,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.8,
    fontWeight: '500',
  },
  helpTextContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.SAGE_PRIMARY + '30',
  },
  helpText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 12,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 4,
  },
});