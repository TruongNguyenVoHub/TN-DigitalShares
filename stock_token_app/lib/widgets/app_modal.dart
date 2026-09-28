import 'package:flutter/material.dart';

class AppModal extends StatelessWidget {

  //prop
  final String title;
  final VoidCallback onPressed;

  //contructor
  const AppModal({
    super.key,
    required this.title,
    required this.onPressed,
  });

  //build
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(title),
    );
  }
}