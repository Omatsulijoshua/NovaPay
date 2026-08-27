import 'package:flutter/material.dart';
import '../models/transaction.dart';
import 'wallet_card.dart'; // to share formatNaira

class TransactionItem extends StatelessWidget {
  final Transaction transaction;
  final String currentUserId;
  final VoidCallback? onTap;

  const TransactionItem({
    Key? key,
    required this.transaction,
    required this.currentUserId,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final bool isIncoming = transaction.recipientId == currentUserId;
    final String partnerName = isIncoming
        ? (transaction.senderName ?? 'Sender')
        : (transaction.recipientName ?? 'Recipient');

    final Color iconBg = isIncoming ? const Color(0xFFECFDF5) : Colors.grey[100]!;
    final Color iconColor = isIncoming ? const Color(0xFF059669) : Colors.grey[600]!;
    final IconData icon = isIncoming ? Icons.arrow_downward : Icons.arrow_upward;

    final String amountPrefix = isIncoming ? '+' : '-';
    final Color amountColor = isIncoming ? const Color(0xFF059669) : Colors.grey[800]!;

    final formattedDate =
        "${transaction.createdAt.day} ${getMonthName(transaction.createdAt.month)} ${transaction.createdAt.hour.toString().padLeft(2, '0')}:${transaction.createdAt.minute.toString().padLeft(2, '0')}";

    Color statusColor = Colors.grey;
    Color statusBg = Colors.grey[100]!;
    if (transaction.status == 'SUCCESS') {
      statusColor = const Color(0xFF047857);
      statusBg = const Color(0xFFECFDF5);
    } else if (transaction.status == 'PENDING') {
      statusColor = Colors.amber[700]!;
      statusBg = Colors.amber[50]!;
    } else if (transaction.status == 'FAILED') {
      statusColor = Colors.red[700]!;
      statusBg = Colors.red[50]!;
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: Colors.grey[100]!),
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.all(10),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isIncoming ? 'Received Money' : 'Sent Money',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isIncoming ? 'From: $partnerName' : 'To: $partnerName',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[500],
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    formattedDate,
                    style: TextStyle(
                      fontSize: 9,
                      color: Colors.grey[400],
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  "$amountPrefix${formatNaira(transaction.amount)}",
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: amountColor,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  decoration: BoxDecoration(
                    color: statusBg,
                    borderRadius: BorderRadius.circular(100),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  child: Text(
                    transaction.status,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String getMonthName(int month) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    if (month >= 1 && month <= 12) {
      return months[month - 1];
    }
    return '';
  }
}
