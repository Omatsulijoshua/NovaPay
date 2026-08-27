import 'package:supabase_flutter/supabase_flutter.dart';

class RecipientLookupResult {
  final String fullName;
  final String accountNumber;

  RecipientLookupResult({
    required this.fullName,
    required this.accountNumber,
  });

  factory RecipientLookupResult.fromJson(Map<String, dynamic> json) {
    return RecipientLookupResult(
      fullName: json['full_name'] as String,
      accountNumber: json['account_number'] as String,
    );
  }
}

class TransferResult {
  final bool success;
  final String reference;
  final double amount;
  final String recipientName;
  final String recipientAccount;
  final DateTime createdAt;

  TransferResult({
    required this.success,
    required this.reference,
    required this.amount,
    required this.recipientName,
    required this.recipientAccount,
    required this.createdAt,
  });

  factory TransferResult.fromJson(Map<String, dynamic> json) {
    return TransferResult(
      success: json['success'] as bool,
      reference: json['reference'] as String,
      amount: (json['amount'] as num).toDouble(),
      recipientName: json['recipient_name'] as String,
      recipientAccount: json['recipient_account'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}

class TransferService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<RecipientLookupResult?> lookupRecipient(String accountNumber) async {
    try {
      final List<dynamic> response = await _client.rpc('lookup_recipient', params: {
        'recipient_account_number': accountNumber,
      });

      if (response.isNotEmpty) {
        return RecipientLookupResult.fromJson(response.first as Map<String, dynamic>);
      }
      return null;
    } catch (e) {
      rethrow;
    }
  }

  Future<TransferResult> transferMoney(
    String recipientAccountNumber,
    double amount,
    String description,
  ) async {
    try {
      final response = await _client.rpc('transfer_money', params: {
        'recipient_account_number': recipientAccountNumber,
        'transfer_amount': amount,
        'transfer_description': description,
      });

      return TransferResult.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      rethrow;
    }
  }
}
