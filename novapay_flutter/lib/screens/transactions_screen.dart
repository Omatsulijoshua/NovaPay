import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/transaction_service.dart';
import '../models/transaction.dart';
import '../widgets/transaction_item.dart';

class TransactionsScreen extends StatefulWidget {
  final bool isTab;

  const TransactionsScreen({
    Key? key,
    this.isTab = true,
  }) : super(key: key);

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  String _filterType = 'ALL'; // ALL, SENT, RECEIVED
  String _searchQuery = '';
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.trim();
      });
    });
  }

  void _refreshTransactions() {
    final userId = context.read<AuthService>().user?.id;
    if (userId != null) {
      context.read<TransactionService>().fetchTransactions(userId);
    }
  }

  List<Transaction> _getFilteredTransactions(List<Transaction> allTxs, String currentUserId) {
    return allTxs.where((tx) {
      final bool isIncoming = tx.recipientId == currentUserId;

      // Tab filter
      if (_filterType == 'SENT' && isIncoming) return false;
      if (_filterType == 'RECEIVED' && !isIncoming) return false;

      // Search query filter
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final partnerName = isIncoming
            ? (tx.senderName ?? 'Sender').toLowerCase()
            : (tx.recipientName ?? 'Recipient').toLowerCase();
        final reference = tx.reference.toLowerCase();
        final description = (tx.description ?? '').toLowerCase();

        return partnerName.contains(query) ||
            reference.contains(query) ||
            description.contains(query);
      }

      return true;
    }).toList();
  }

  Map<String, List<Transaction>> _groupTransactions(List<Transaction> txs) {
    final Map<String, List<Transaction>> groups = {};
    final today = DateTime.now();
    final yesterday = DateTime.now().subtract(const Duration(days: 1));

    for (final tx in txs) {
      String dateKey = '';
      if (tx.createdAt.year == today.year &&
          tx.createdAt.month == today.month &&
          tx.createdAt.day == today.day) {
        dateKey = 'Today';
      } else if (tx.createdAt.year == yesterday.year &&
          tx.createdAt.month == yesterday.month &&
          tx.createdAt.day == yesterday.day) {
        dateKey = 'Yesterday';
      } else {
        dateKey = "${tx.createdAt.day} ${getMonthName(tx.createdAt.month)} ${tx.createdAt.year}";
      }

      if (!groups.containsKey(dateKey)) {
        groups[dateKey] = [];
      }
      groups[dateKey]!.add(tx);
    }

    return groups;
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

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profile = context.watch<AuthService>().profile;
    final txService = context.watch<TransactionService>();

    final filteredTxs = _getFilteredTransactions(txService.transactions, profile?.id ?? '');
    final groupedTxs = _groupTransactions(filteredTxs);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: widget.isTab
          ? null
          : AppBar(
              title: const Text('Transaction History', style: TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.bold)),
              backgroundColor: Colors.transparent,
              elevation: 0,
              iconTheme: const IconThemeData(color: Colors.black87),
            ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header & Inputs
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (widget.isTab) ...[
                  const Text(
                    'Transaction History',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Search Input
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search by name, reference, or description...',
                    prefixIcon: const Icon(Icons.search, color: Colors.grey, size: 20),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey[200]!),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey[200]!),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF059669), width: 1.5),
                    ),
                  ),
                  style: const TextStyle(fontSize: 13),
                ),
                const SizedBox(height: 12),

                // Filters Tabs
                Row(
                  children: ['ALL', 'SENT', 'RECEIVED'].map((type) {
                    final isSelected = _filterType == type;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _filterType = type;
                          });
                        },
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF059669) : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: isSelected ? const Color(0xFF059669) : Colors.grey[200]!),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          alignment: Alignment.center,
                          child: Text(
                            type.substring(0, 1) + type.substring(1).toLowerCase(),
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? Colors.white : Colors.grey[600],
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),

          // List Area
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                _refreshTransactions();
              },
              color: const Color(0xFF059669),
              child: txService.loading
                  ? const Center(child: CircularProgressIndicator(color: Color(0xFF059669)))
                  : filteredTxs.isEmpty
                      ? ListView(
                          children: [
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 64),
                              child: Column(
                                children: [
                                  Icon(Icons.filter_list_off, color: Colors.grey[300], size: 48),
                                  const SizedBox(height: 12),
                                  Text(
                                    'No Transactions Found',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.grey[500],
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Try adjusting your search criteria.',
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: Colors.grey[400],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: groupedTxs.keys.length,
                          itemBuilder: (context, index) {
                            final dateHeader = groupedTxs.keys.elementAt(index);
                            final txList = groupedTxs[dateHeader]!;

                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.only(left: 4, top: 12, bottom: 8),
                                  child: Text(
                                    dateHeader.toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.grey[400],
                                      letterSpacing: 0.8,
                                    ),
                                  ),
                                ),
                                ListView.separated(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: txList.length,
                                  separatorBuilder: (context, i) => const SizedBox(height: 8),
                                  itemBuilder: (context, i) {
                                    final tx = txList[i];
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
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }
}
