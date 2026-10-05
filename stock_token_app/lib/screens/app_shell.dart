import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AppShell extends StatefulWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;

  final _navItems = [
    (icon: Icons.home_rounded, label: 'Trang chủ', path: '/dashboard'),
    (icon: Icons.candlestick_chart, label: 'Giao dịch', path: '/trade'),
    (icon: Icons.account_balance_wallet, label: 'Ví tiền', path: '/wallet'),
    (icon: Icons.history, label: 'Lịch sử', path: '/history'),
    (icon: Icons.person, label: 'Cá nhân', path: '/profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Header (tương đương <header> trong layout.tsx)
      appBar: AppBar(
        title: Row(
          children: [Container(/* Logo TNT */), const Text('Stock Token')],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.notifications), onPressed: () {}),
        ],
      ),

      // Main content
      body: widget.child,

      // Bottom Navigation (tương đương <nav> trong layout.tsx)
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          setState(() => _currentIndex = index);
          context.go(_navItems[index].path);
        },
        items: _navItems
            .map(
              (item) => BottomNavigationBarItem(
                icon: Icon(item.icon),
                label: item.label,
              ),
            )
            .toList(),
      ),
    );
  }
}
