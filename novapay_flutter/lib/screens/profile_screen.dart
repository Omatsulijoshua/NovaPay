import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_input.dart';
import '../widgets/wallet_card.dart'; // for formatAccountNumber

class ProfileScreen extends StatefulWidget {
  final bool isTab;

  const ProfileScreen({
    Key? key,
    this.isTab = true,
  }) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _nameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _editMode = false;
  bool _editLoading = false;
  String? _editError;

  bool _pwLoading = false;
  String? _pwError;
  bool _pwSuccess = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final profile = context.read<AuthService>().profile;
    if (profile != null && !_editMode) {
      _nameController.text = profile.fullName;
    }
  }

  Future<void> _handleUpdateProfile() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      setState(() {
        _editError = 'Name cannot be empty.';
      });
      return;
    }

    setState(() {
      _editLoading = true;
      _editError = null;
    });

    try {
      await context.read<AuthService>().updateProfileName(name);
      setState(() {
        _editMode = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile name updated!'), backgroundColor: Color(0xFF059669)),
      );
    } catch (e) {
      setState(() {
        _editError = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _editLoading = false;
        });
      }
    }
  }

  Future<void> _handleUpdatePassword() async {
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (password.isEmpty || confirmPassword.isEmpty) {
      setState(() {
        _pwError = 'Please fill in all fields.';
      });
      return;
    }

    if (password.length < 6) {
      setState(() {
        _pwError = 'Password must be at least 6 characters.';
      });
      return;
    }

    if (password != confirmPassword) {
      setState(() {
        _pwError = 'Passwords do not match.';
      });
      return;
    }

    setState(() {
      _pwLoading = true;
      _pwError = null;
      _pwSuccess = false;
    });

    try {
      await context.read<AuthService>().updatePassword(password);
      setState(() {
        _pwSuccess = true;
        _passwordController.clear();
        _confirmPasswordController.clear();
      });
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          setState(() {
            _pwSuccess = false;
          });
        }
      });
    } catch (e) {
      setState(() {
        _pwError = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _pwLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();
    final profile = authService.profile;

    final memberSince = profile != null
        ? "${profile.createdAt.day} ${getMonthName(profile.createdAt.month)} ${profile.createdAt.year}"
        : 'N/A';

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: widget.isTab
          ? null
          : AppBar(
              title: const Text('My Profile', style: TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.bold)),
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
                'My Profile',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Profile info Card
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
                  _editMode
                      ? Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            CustomInput(
                              label: 'Full Name',
                              controller: _nameController,
                              obscureText: false,
                            ),
                            if (_editError != null)
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(_editError!, style: const TextStyle(color: Colors.redAccent, fontSize: 11)),
                              ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                OutlinedButton(
                                  onPressed: () {
                                    setState(() {
                                      _editMode = false;
                                      _nameController.text = profile?.fullName ?? '';
                                    });
                                  },
                                  child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
                                ),
                                const SizedBox(width: 8),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669)),
                                  onPressed: _editLoading ? null : _handleUpdateProfile,
                                  child: const Text('Save', style: TextStyle(color: Colors.white)),
                                ),
                              ],
                            ),
                          ],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('FULL NAME', style: TextStyle(color: Colors.grey[400], fontSize: 10, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.person, color: Colors.grey, size: 16),
                                    const SizedBox(width: 6),
                                    Text(
                                      profile?.fullName ?? '',
                                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black87),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            IconButton(
                              icon: const Icon(Icons.edit, color: Color(0xFF059669), size: 18),
                              onPressed: () {
                                setState(() {
                                  _editMode = true;
                                });
                              },
                            ),
                          ],
                        ),
                  
                  const SizedBox(height: 16),
                  Divider(color: Colors.grey[100]),
                  const SizedBox(height: 16),

                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('EMAIL ADDRESS', style: TextStyle(color: Colors.grey[400], fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.mail, color: Colors.grey, size: 16),
                          const SizedBox(width: 6),
                          Text(
                            profile?.email ?? 'N/A',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black87),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),
                  Divider(color: Colors.grey[100]),
                  const SizedBox(height: 16),

                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('ACCOUNT NUMBER', style: TextStyle(color: Colors.grey[400], fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(
                        formatAccountNumber(profile?.accountNumber ?? ''),
                        style: const TextStyle(fontSize: 15, fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Colors.black87),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),
                  Divider(color: Colors.grey[100]),
                  const SizedBox(height: 16),

                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('MEMBER SINCE', style: TextStyle(color: Colors.grey[400], fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.calendar_today, color: Colors.grey, size: 14),
                          const SizedBox(width: 6),
                          Text(
                            memberSince,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black87),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Change Password Card
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
                  Row(
                    children: const [
                      Icon(Icons.key, color: Colors.grey, size: 18),
                      SizedBox(width: 8),
                      Text('CHANGE PASSWORD', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black54)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  if (_pwSuccess) ...[
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        border: Border.all(color: const Color(0xFFD1FAE5)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.all(12),
                      child: const Text(
                        'Password changed successfully!',
                        style: TextStyle(color: Color(0xFF059669), fontSize: 12, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  if (_pwError != null) ...[
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.red[50],
                        border: Border.all(color: Colors.red[100]!),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Text(
                        _pwError!,
                        style: TextStyle(color: Colors.red[700], fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  CustomInput(
                    label: 'New Password',
                    placeholder: 'Min. 6 characters',
                    controller: _passwordController,
                    obscureText: true,
                  ),
                  const SizedBox(height: 12),
                  CustomInput(
                    label: 'Confirm New Password',
                    placeholder: 'Confirm password',
                    controller: _confirmPasswordController,
                    obscureText: true,
                  ),
                  const SizedBox(height: 16),
                  CustomButton(
                    text: 'Change Password',
                    loading: _pwLoading,
                    onPressed: _handleUpdatePassword,
                    isSecondary: true,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout button
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red[50],
                elevation: 0,
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: Colors.red[100]!),
                ),
              ),
              onPressed: () {
                context.read<AuthService>().signOut();
              },
              icon: const Icon(Icons.logout, color: Colors.redAccent, size: 18),
              label: const Text(
                'Log Out',
                style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String getMonthName(int month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    if (month >= 1 && month <= 12) {
      return months[month - 1];
    }
    return '';
  }
}
