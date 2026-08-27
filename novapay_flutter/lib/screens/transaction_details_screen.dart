import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:printing/printing.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../services/auth_service.dart';
import '../services/transaction_service.dart';
import '../models/transaction.dart';
import '../widgets/wallet_card.dart'; // for formatNaira and formatAccountNumber

class TransactionDetailsScreen extends StatefulWidget {
  const TransactionDetailsScreen({Key? key}) : super(key: key);

  @override
  State<TransactionDetailsScreen> createState() => _TransactionDetailsScreenState();
}

class _TransactionDetailsScreenState extends State<TransactionDetailsScreen> {
  Transaction? _tx;
  bool _loading = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final txId = ModalRoute.of(context)?.settings.arguments as String?;
    if (txId != null) {
      _loadDetails(txId);
    }
  }

  void _loadDetails(String id) {
    final txs = context.read<TransactionService>().transactions;
    final match = txs.firstWhere((t) => t.id == id);
    setState(() {
      _tx = match;
      _loading = false;
    });
  }

  void _shareReceipt() {
    if (_tx == null) return;
    final shareText =
        'NovaPay Digital Receipt\nStatus: ${_tx!.status}\nAmount: ${formatNaira(_tx!.amount)}\nSender: ${_tx!.senderName ?? 'Sandbox'}\nRecipient: ${_tx!.recipientName ?? 'Sandbox'}\nRef: ${_tx!.reference}\nDate: ${_tx!.createdAt.toLocal().toString()}';
    Share.share(shareText, subject: 'NovaPay Transaction Receipt');
  }

  Future<void> _printReceipt() async {
    if (_tx == null) return;
    final doc = pw.Document();

    doc.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.roll80,
        build: (pw.Context context) {
          return pw.Padding(
            padding: const pw.EdgeInsets.all(12),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Center(
                  child: pw.Text(
                    'NOVAPAY RECEIPT',
                    style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 12),
                  ),
                ),
                pw.SizedBox(height: 8),
                pw.Divider(thickness: 1),
                pw.SizedBox(height: 8),
                pw.Text('Status: ${_tx!.status}', style: const pw.TextStyle(fontSize: 10)),
                pw.Text('Amount: ${formatNaira(_tx!.amount)}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10)),
                pw.Text('Type: ${_tx!.transactionType}', style: const pw.TextStyle(fontSize: 10)),
                pw.Text('From: ${_tx!.senderName ?? 'N/A'}', style: const pw.TextStyle(fontSize: 10)),
                pw.Text('To: ${_tx!.recipientName ?? 'N/A'}', style: const pw.TextStyle(fontSize: 10)),
                pw.Text('Reference: ${_tx!.reference}', style: const pw.TextStyle(fontSize: 10)),
                pw.Text('Date: ${_tx!.createdAt.toLocal().toString()}', style: const pw.TextStyle(fontSize: 10)),
                pw.SizedBox(height: 16),
                pw.Center(
                  child: pw.Text(
                    '*** Demo Transaction Only ***',
                    style: pw.TextStyle(fontStyle: pw.FontStyle.italic, fontSize: 8),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => doc.save(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final profile = context.watch<AuthService>().profile;
    
    if (_loading || _tx == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Receipt Details')),
        body: const Center(child: CircularProgressIndicator(color: Color(0xFF059669))),
      );
    }

    final bool isIncoming = _tx!.recipientId == profile?.id;
    final formattedDate =
        "${_tx!.createdAt.day} ${getMonthName(_tx!.createdAt.month)} ${_tx!.createdAt.year} ${_tx!.createdAt.hour.toString().padLeft(2, '0')}:${_tx!.createdAt.minute.toString().padLeft(2, '0')}";

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Receipt Details', style: TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.grey[200]!),
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Container(
                    decoration: const BoxDecoration(color: Color(0xFFECFDF5), shape: BoxShape.circle),
                    padding: const EdgeInsets.all(12),
                    child: const Icon(Icons.check_circle, color: Color(0xFF059669), size: 40),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Transaction Successful',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey[400], letterSpacing: 0.8),
                  ),
                  const SizedBox(height: 2),
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                    child: Text(
                      _tx!.status,
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF059669)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "${isIncoming ? '+' : '-'}${formatNaira(_tx!.amount)}",
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                  const SizedBox(height: 20),
                  Divider(color: Colors.grey[100]),
                  const SizedBox(height: 16),
                  
                  _buildDetailRow('Transaction Type', _tx!.transactionType),
                  _buildDetailRow('Sender Name', _tx!.senderName ?? 'Sandbox'),
                  _buildDetailRow('Sender Account', formatAccountNumber(_tx!.senderAccount ?? 'N/A')),
                  _buildDetailRow('Recipient Name', _tx!.recipientName ?? 'Sandbox'),
                  _buildDetailRow('Recipient Account', formatAccountNumber(_tx!.recipientAccount ?? 'N/A')),
                  _buildDetailRow('Reference', _tx!.reference),
                  _buildDetailRow('Description', _tx!.description ?? 'No description'),
                  _buildDetailRow('Date & Time', formattedDate),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      side: BorderSide(color: Colors.grey[300]!),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: _printReceipt,
                    icon: const Icon(Icons.print, size: 14, color: Colors.black87),
                    label: Text(
                      'Print Receipt',
                      style: TextStyle(color: Colors.grey[800], fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: _shareReceipt,
                    icon: const Icon(Icons.share, size: 14, color: Colors.white),
                    label: const Text(
                      'Share Receipt',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
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

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[400], fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(color: Colors.black87, fontSize: 11, fontWeight: FontWeight.bold),
              textAlign: TextAlign.right,
            ),
          ),
        ],
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
