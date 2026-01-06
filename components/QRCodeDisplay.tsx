import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '@/theme/palette';
import { TYPOGRAPHY } from '@/theme/typography';
import { generateQRCodeDataURL } from '@/utils/qrCodeGenerator';
import { ActivityIndicator } from 'react-native';

interface QRCodeDisplayProps {
  amount: number;
  transactionId: string;
  upiId?: string;
  payeeName?: string;
  onPress?: () => void;
  size?: 'normal' | 'large';
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  amount,
  transactionId,
  upiId,
  payeeName,
  onPress,
  size = 'normal',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        const dataUrl = await generateQRCodeDataURL(amount, transactionId);
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [amount, transactionId]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setShowModal(true);
    }
  };

  const qrSize = size === 'large' ? 300 : 200;

  if (loading) {
    return (
      <View style={[styles.container, { width: qrSize, height: qrSize }]}>
        <ActivityIndicator size="large" color={COLORS.SAGE_PRIMARY} />
      </View>
    );
  }

  if (!qrDataUrl) {
    return (
      <View style={[styles.container, { width: qrSize, height: qrSize }]}>
        <Text style={styles.errorText}>Failed to generate QR code</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.container}
        activeOpacity={0.9}
      >
        <Text style={styles.amountText}>₹{amount}</Text>
        <Image
          source={{ uri: qrDataUrl }}
          style={{ width: qrSize, height: qrSize }}
          resizeMode="contain"
        />
        <Text style={styles.tapHint}>Tap to enlarge</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalAmountText}>₹{amount}</Text>
            
            <Image
              source={{ uri: qrDataUrl }}
              style={{ width: 300, height: 300 }}
              resizeMode="contain"
            />
            
            <Text style={styles.modalHint}>Scan with any UPI app</Text>
            
            {upiId && (
              <Text style={styles.upiDetails}>UPI ID: {upiId}</Text>
            )}
            {payeeName && (
              <Text style={styles.upiDetails}>Payee: {payeeName}</Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountText: {
    fontFamily: TYPOGRAPHY.PAGE_TITLE.fontFamily,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 12,
  },
  tapHint: {
    fontFamily: TYPOGRAPHY.METADATA.fontFamily,
    fontSize: 12,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    marginTop: 8,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CORAL_ERROR,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.SAND_BG,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.SAGE_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalAmountText: {
    fontFamily: TYPOGRAPHY.PAGE_TITLE.fontFamily,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.FOREST_ACCENT,
    marginBottom: 16,
  },
  modalHint: {
    fontFamily: TYPOGRAPHY.BODY.fontFamily,
    fontSize: 14,
    color: COLORS.CHARCOAL_TEXT,
    marginTop: 16,
    opacity: 0.8,
  },
  upiDetails: {
    fontFamily: TYPOGRAPHY.SMALL.fontFamily,
    fontSize: 11,
    color: COLORS.CHARCOAL_TEXT,
    opacity: 0.7,
    marginTop: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.CORAL_ERROR,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.SAND_BG,
    fontSize: 18,
    fontWeight: '600',
  },
});