import 'dart:async';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/profile.dart';

class AuthService extends ChangeNotifier {
  final SupabaseClient _client = Supabase.instance.client;
  User? _user;
  Profile? _profile;
  bool _loading = true;
  StreamSubscription<AuthState>? _authStateSubscription;

  AuthService() {
    _init();
  }

  User? get user => _user;
  Profile? get profile => _profile;
  bool get loading => _loading;
  bool get isAuthenticated => _user != null;

  void _init() {
    _user = _client.auth.currentUser;
    if (_user != null) {
      fetchProfile();
    } else {
      _loading = false;
      notifyListeners();
    }

    _authStateSubscription = _client.auth.onAuthStateChange.listen((data) async {
      _user = data.session?.user;
      if (_user != null) {
        await fetchProfile();
      } else {
        _profile = null;
        _loading = false;
        notifyListeners();
      }
    });
  }

  Future<void> fetchProfile() async {
    if (_user == null) return;
    try {
      final data = await _client
          .from('profiles')
          .select()
          .eq('id', _user!.id)
          .single();
      _profile = Profile.fromJson(data);
    } catch (e) {
      _profile = null;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> signUp(String email, String password, String fullName) async {
    try {
      await _client.auth.signUp(
        email: email,
        password: password,
        data: {'full_name': fullName},
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signIn(String email, String password) async {
    try {
      await _client.auth.signInWithPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  Future<void> updateProfileName(String fullName) async {
    if (_user == null) return;
    try {
      await _client.from('profiles').update({
        'full_name': fullName,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', _user!.id);
      await fetchProfile();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updatePassword(String newPassword) async {
    try {
      await _client.auth.updateUser(UserAttributes(password: newPassword));
    } catch (e) {
      rethrow;
    }
  }

  Future<void> sendPasswordReset(String email) async {
    try {
      await _client.auth.resetPasswordForEmail(
        email,
        redirectTo: 'io.supabase.novapay://reset-password',
      );
    } catch (e) {
      rethrow;
    }
  }

  @override
  void dispose() {
    _authStateSubscription?.cancel();
    super.dispose();
  }
}
