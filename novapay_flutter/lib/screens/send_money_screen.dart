import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/wallet_service.dart';
import '../services/transfer_service.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';
import '../widgets/wallet_card.dart'; // for formatNaira

class SendMoneyScreen extends StatefulWidget {
  final bool isTab;

  const SendMoneyScreen({
    Key? key,
    this.isTab = true,
  }) : super(key: key);

  @override
  State<SendMoneyScreen> createState() => _SendMoneyScreenState();
}

class _SendMoneyScreenState extends State<SendMoneyScreen> {
  final _accountController = TextEditingController();
  final _amountController = TextEditingController();
  final _descriptionController = TextEditingController();

  final _transferService = TransferService();
  
  RecipientLookupResult? _recipient;
  bool _lookupLoading = false;
  String? _lookupError;

  bool _transferLoading = false;
  String? _transferError;
  TransferResult? _transferSuccess;

  @override
  void initState() {
    super.initState();
    _accountController.addListener(_onAccountNumberChanged);
  }

  void _onAccountNumberChanged() {
    final text = _accountController.text.replaceAll(RegExp(r'\D'), '');
    if (text.length == 10) {
      _handleRecipientLookup(text);
    } else {
      if (_recipient != null || _lookupError != null) {
        setState(() {
          _recipient = null;
          _lookupError = null;
        });
      }
    }
  }

  Future<void> _handleRecipientLookup(String accountNumber) async {
    final senderAccount = context.read<AuthService>().profile?.accountNumber;
    if (accountNumber == senderAccount) {
      setState(() {
        _lookupError = 'You cannot transfer money to your own account.';
        _recipient = null;
      });
      return;
    }

    setState(() {
      _lookupLoading = true;
      _lookupError = null;
      _recipient = null;
    });

    try {
      final result = await _transferService.lookupRecipient(accountNumber);
      if (mounted) {
        setState(() {
          if (result != null) {
            _recipient = result;
          } else {
            _lookupError = 'Account not found. Check the account number and try again.';
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _lookupError = 'Failed to verify account number.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _lookupLoading = false;
        });
      }
    }
  }

  void _handleNext() {
    final amountText = _amountController.text;
    final amount = double.tryParse(amountText) ?? 0.0;
    final balance = context.read<WalletService>().wallet?.balance ?? 0.0;

    if (amount <= 0) {
      setState(() {
        _transferError = 'Enter a valid amount greater than ₦0.';
      });
      return;
    }

    if (amount > balance) {
      setState(() {
        _transferError = 'Insufficient Balance. You do not have enough funds to complete this transfer.';
      });
      return;
    }

    if (_recipient == null) {
      setState(() {
        _transferError = 'Please verify the recipient account number first.';
      });
      return;
    }

    setState(() {
      _transferError = null;
    });

    _showConfirmationSheet(amount, _descriptionController.text.trim());
  }

  void _showConfirmationSheet(double amount, String description) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Confirm Transfer',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
              const SizedBox(height: 16),
              Divider(color: Colors.grey[200]),
              const SizedBox(height: 12),
              
              Text(
                'Amount to Send',
                style: TextStyle(fontSize: 11, color: Colors.grey[500], fontWeight: FontWeight.bold),
              ),
              Text(
                formatNaira(amount),
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
              ),
              const SizedBox(height: 20),

              _buildConfirmRow('Recipient Name', _recipient!.fullName),
              _buildConfirmRow('Account Number', formatAccountNumber(_recipient!.accountNumber)),
              if (description.isNotEmpty)
                _buildConfirmRow('Description', description),
              
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        side: BorderSide(color: Colors.grey[300]!),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        'Cancel',
                        style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomButton(
                      text: 'Confirm',
                      onPressed: () {
                        Navigator.pop(context);
                        _executeTransfer(amount, description);
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildConfirmRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[500], fontSize: 12, fontWeight: FontWeight.bold)),
          Text(value, style: const TextStyle(color: Colors.black87, fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Future<void> _executeTransfer(double amount, String description) async {
    setState(() {
      _transferLoading = true;
      _transferError = null;
    });

    try {
      final result = await _transferService.transferMoney(
        _accountController.text,
        amount,
        description,
      );

      final userId = context.read<AuthService>().user?.id;
      if (userId != null) {
        await context.read<WalletService>().fetchWallet(userId);
      }

      setState(() {
        _transferSuccess = result;
      });
    } catch (e) {
      setState(() {
        _transferError = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _transferLoading = false;
        });
      }
    }
  }

  void _resetForm() {
    setState(() {
      _accountController.clear();
      _amountController.clear();
      _descriptionController.clear();
      _recipient = null;
      _transferSuccess = null;
      _transferError = null;
    });
  }

  @override
  void dispose() {
    _accountController.removeListener(_onAccountNumberChanged);
    _accountController.dispose();
    _amountController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_transferSuccess != null) {
      return Scaffold(
        backgroundColor: Colors.grey[50],
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  constraints: const BoxConstraints(maxWidth: 400),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: Colors.grey[200]!),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.02),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.check_circle,
                        color: Color(0xFF059669),
                        size: 64,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Transfer Successful',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF059669),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        formatNaira(_transferSuccess!.amount),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Divider(color: Colors.grey[100]),
                      const SizedBox(height: 16),
                      _buildReceiptRow('Sent to', _transferSuccess!.recipientName),
                      _buildReceiptRow('Account Number', formatAccountNumber(_transferSuccess!.recipientAccount)),
                      _buildReceiptRow('Reference', _transferSuccess!.reference),
                      _buildReceiptRow(
                        'Date',
                        "${_transferSuccess!.createdAt.day} ${getMonthName(_transferSuccess!.createdAt.month)} ${_transferSuccess!.createdAt.year}",
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Container(
                  constraints: const BoxConstraints(maxWidth: 400),
                  child: Column(
                    children: [
                      CustomButton(
                        text: 'Done',
                        onPressed: _resetForm,
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          side: const BorderSide(color: Color(0xFF059669)),
                        ),
                        onPressed: () {
                          final ref = _transferSuccess!.reference;
                          _resetForm();
                          Navigator.pushNamed(context, '/transaction-history-tab');
                        },
                        child: const Text(
                          'View Receipts',
                          style: TextStyle(
                            color: Color(0xFF059669),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: widget.isTab
          ? null
          : AppBar(
              title: const Text('Send Money', style: TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.bold)),
              backgroundColor: Colors.transparent,
              elevation: 0,
              iconTheme: const IconThemeData(color: Colors.black87),
            ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.isTab) ...[
              const Text(
                'Send Money',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 20),
            ],

            if (_transferError != null) ...[
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  border: Border.all(color: Colors.red[100]!),
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.all(14),
                child: Text(
                  _transferError!,
                  style: TextStyle(fontSize: 12, color: Colors.red[700], fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 16),
            ],

            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.grey[200]!),
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CustomInput(
                    label: 'Recipient Account Number',
                    placeholder: '1029384756',
                    controller: _accountController,
                    keyboardType: TextInputType.number,
                    maxLength: 10,
                    obscureText: false,
                  ),
                  const SizedBox(height: 10),

                  if (_lookupLoading)
                    Padding(
                      padding: const EdgeInsets.only(left: 4),
                      child: Row(
                        children: const [
                          SizedBox(
                            height: 12,
                            width: 12,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF059669)),
                          ),
                          SizedBox(width: 8),
                          Text('Verifying account...', style: TextStyle(color: Colors.grey, fontSize: 11)),
                        ],
                      ),
                    ),

                  if (_recipient != null)
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        border: Border.all(color: const Color(0xFFD1FAE5)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          Container(
                            decoration: const BoxDecoration(color: Color(0xFF059669), shape: BoxShape.circle),
                            padding: const EdgeInsets.all(6),
                            child: const Icon(Icons.person, color: Colors.white, size: 16),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Recipient Found', style: TextStyle(color: Color(0xFF059669), fontSize: 10, fontWeight: FontWeight.bold)),
                                Text(_recipient!.fullName, style: const TextStyle(color: Color(0xFF064E3B), fontSize: 12, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                  if (_lookupError != null)
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.red[50],
                        border: Border.all(color: Colors.red[100]!),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Text(
                        _lookupError!,
                        style: TextStyle(color: Colors.red[700], fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  
                  const SizedBox(height: 16),
                  CustomInput(
                    label: 'Amount (₦)',
                    placeholder: '0.00',
                    controller: _amountController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  ),

                  const SizedBox(height: 16),
                  CustomInput(
                    label: 'Description',
                    placeholder: 'What is this for? (optional)',
                    controller: _descriptionController,
                  ),

                  const SizedBox(height: 24),
                  CustomButton(
                    text: 'Next',
                    loading: _transferLoading,
                    onPressed: _recipient != null && !_lookupLoading ? _handleNext : null,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[500], fontSize: 12, fontWeight: FontWeight.bold)),
          Text(value, style: const TextStyle(color: Colors.black87, fontSize: 12, fontWeight: FontWeight.bold)),
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
