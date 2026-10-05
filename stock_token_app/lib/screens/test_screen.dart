import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:stock_token_app/widgets/app_button.dart';

class TestScreen extends StatelessWidget {
  const TestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Text("Test"),
          AppButton(title: 'back', onPressed: () => {context.pop()}),
        ],
      ),
    );
  }
}
