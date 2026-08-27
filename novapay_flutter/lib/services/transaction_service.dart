import 'dart:async';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/transaction.dart';

class TransactionService extends ChangeNotifier {
  final SupabaseClient _client = Supabase.instance.client;
  List<Transaction> _transactions = [];
  bool _loading = true;
  RealtimeChannel? _txSubscription;

  List<Transaction> get transactions => _transactions;
  bool get loading => _loading;

  Future<void> fetchTransactions(String userId) async {
    try {
      final List<dynamic> response = await _client.rpc('get_transaction_history');
      _transactions = response.map((json) => Transaction.fromJson(json)).toList();
      _subscribeToTransactionChanges(userId);
    } catch (e) {
      _transactions = [];
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void _subscribeToTransactionChanges(String userId) {
    _txSubscription?.unsubscribe();

    _txSubscription = _client
        .channel('tx_changes')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'transactions',
          callback: (payload) {
            fetchTransactions(userId);
          },
        )
        .subscribe();
  }

  void clearTransactions() {
    _txSubscription?.unsubscribe();
    _txSubscription = null;
    _transactions = [];
    _loading = true;
    notifyListeners();
  }

  @override
  void dispose() {
    _txSubscription?.unsubscribe();
    super.dispose();
  }
}
