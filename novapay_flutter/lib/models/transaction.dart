class Transaction {
  final String id;
  final String reference;
  final String? senderId;
  final String? recipientId;
  final double amount;
  final String currency;
  final String transactionType;
  final String status;
  final String? description;
  final DateTime createdAt;

  // Resolved details from get_transaction_history RPC
  final String? senderName;
  final String? senderAccount;
  final String? recipientName;
  final String? recipientAccount;

  Transaction({
    required this.id,
    required this.reference,
    this.senderId,
    this.recipientId,
    required this.amount,
    required this.currency,
    required this.transactionType,
    required this.status,
    this.description,
    required this.createdAt,
    this.senderName,
    this.senderAccount,
    this.recipientName,
    this.recipientAccount,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] as String,
      reference: json['reference'] as String,
      senderId: json['sender_id'] as String?,
      recipientId: json['recipient_id'] as String?,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'NGN',
      transactionType: json['transaction_type'] as String,
      status: json['status'] as String,
      description: json['description'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      senderName: json['sender_name'] as String?,
      senderAccount: json['sender_account'] as String?,
      recipientName: json['recipient_name'] as String?,
      recipientAccount: json['recipient_account'] as String?,
    );
  }
}
