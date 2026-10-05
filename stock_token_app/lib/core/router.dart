// File: lib/core/router.dart
import 'package:go_router/go_router.dart';
import 'package:stock_token_app/screens/dashboard_screen.dart';
import 'package:stock_token_app/screens/playground_screen.dart';
import 'package:stock_token_app/screens/test_screen.dart';
import 'package:stock_token_app/screens/app_shell.dart';

final goRouter = GoRouter(
  initialLocation: '/dashboard',
  routes: [
    ShellRoute(
      builder: (context, state, child) => AppShell(child: child),
      routes: [
        GoRoute(path: '/dashboard', builder: (_, __) => DashboardScreen()),
        //import các router khác trong file app_shell.dart cần để quản lý
      ],
    ),

    // Các màn hình phụ bên ngoài (không cần thanh menu)
    GoRoute(path: '/test_screen', builder: (_, __) => TestScreen()),
    GoRoute(path: '/playground', builder: (_, __) => PlaygroundScreen()),
  ],
);
