import 'dart:async';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/wallet.dart';

class WalletService extends ChangeNotifier {
  final SupabaseClient _client = Supabase.instance.client;
  Wallet? _wallet;
  bool _loading = true;
  RealtimeChannel? _walletSubscription;

  Wallet? get wallet => _wallet;
  bool get loading => _loading;

  Future<void> fetchWallet(String userId) async {
    try {
      final data = await _client
          .from('wallets')
          .select()
          .eq('user_id', userId)
          .single();
      _wallet = Wallet.fromJson(data);
      _subscribeToWalletChanges(userId);
    } catch (e) {
      _wallet = null;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void _subscribeToWalletChanges(String userId) {
    _walletSubscription?.unsubscribe();

    _walletSubscription = _client
        .channel('wallet_changes')
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'wallets',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'user_id',
            value: userId,
          ),
          callback: (payload) {
            if (payload.newRecord.isNotEmpty) {
              _wallet = Wallet.fromJson(payload.newRecord);
              notifyListeners();
            }
          },
        )
        .subscribe();
  }

  void clearWallet() {
    _walletSubscription?.unsubscribe();
    _walletSubscription = null;
    _wallet = null;
    _loading = true;
    notifyListeners();
  }

  @override
  void dispose() {
    _walletSubscription?.unsubscribe();
    super.dispose();
  }
}
