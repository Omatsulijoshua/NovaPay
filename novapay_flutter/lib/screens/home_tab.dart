import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/wallet_service.dart';
import '../services/transaction_service.dart';
import '../widgets/wallet_card.dart';
import '../widgets/transaction_item.dart';

class HomeTab extends StatefulWidget {
  final VoidCallback onNavigateToSend;
  final VoidCallback onNavigateToHistory;

  const HomeTab({
    Key? key,
    required this.onNavigateToSend,
    required this.onNavigateToHistory,
  }) : super(key: key);

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  @override
  void initState() {
    super.initState();
    _refreshData();
  }

  void _refreshData() {
    final userId = context.read<AuthService>().user?.id;
    if (userId != null) {
      context.read<WalletService>().fetchWallet(userId);
      context.read<TransactionService>().fetchTransactions(userId);
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final profile = context.watch<AuthService>().profile;
    final walletService = context.watch<WalletService>();
    final txService = context.watch<TransactionService>();

    final displayName = profile != null ? profile.fullName.split(' ')[0] : 'User';

    return RefreshIndicator(
      onRefresh: () async {
        _refreshData();
      },
      color: const Color(0xFF059669),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Greeting Banner
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${_getGreeting()},',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[500],
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '$displayName 👋',
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Wallet Card
            walletService.loading
                ? Container(
                    height: 180,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Center(
                      child: CircularProgressIndicator(color: Color(0xFF059669)),
                    ),
                  )
                : WalletCard(
                    balance: walletService.wallet?.balance ?? 0.0,
                    accountNumber: profile?.accountNumber ?? '0000000000',
                  ),
            const SizedBox(height: 20),

            // Quick Actions
            Row(
              children: [
                Expanded(
                  child: _buildQuickAction(
                    icon: Icons.send,
                    label: 'Send Money',
                    onTap: widget.onNavigateToSend,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildQuickAction(
                    icon: Icons.qr_code,
                    label: 'Receive Money',
                    onTap: () => Navigator.pushNamed(context, '/receive'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildQuickAction(
                    icon: Icons.history,
                    label: 'History',
                    onTap: widget.onNavigateToHistory,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

             // Recent Transactions header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'RECENT TRANSACTIONS',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[500],
                    letterSpacing: 0.8,
                  ),
                ),
                if (txService.transactions.isNotEmpty)
                  GestureDetector(
                    onTap: widget.onNavigateToHistory,
                    child: Row(
                      children: const [
                        Text(
                          'View All',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF059669),
                          ),
                        ),
                        Icon(Icons.chevron_right, color: Color(0xFF059669), size: 14),
                      ],
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),

            // Recent Transactions List
            txService.loading
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 24),
                      child: CircularProgressIndicator(color: Color(0xFF059669)),
                    ),
                  )
                : txService.transactions.isEmpty
                    ? Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey[200]!),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 32),
                        child: Column(
                          children: [
                            Text(
                              'No Transactions Yet',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[500],
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Your transfer history will appear here.',
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.grey[400],
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: txService.transactions.length > 3 ? 3 : txService.transactions.length,
                        separatorBuilder: (context, index) => const SizedBox(height: 8),
                        itemBuilder: (context, index) {
                          final tx = txService.transactions[index];
                          return TransactionItem(
                            transaction: tx,
                            currentUserId: profile?.id ?? '',
                            onTap: () => Navigator.pushNamed(
                              context,
                              '/transaction-details',
                              arguments: tx.id,
                            ),
                          );
                        },
                      ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey[150] ?? Colors.grey[200]!),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          children: [
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                shape: BoxShape.circle,
              ),
              padding: const EdgeInsets.all(10),
              child: Icon(icon, color: const Color(0xFF059669), size: 22),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
