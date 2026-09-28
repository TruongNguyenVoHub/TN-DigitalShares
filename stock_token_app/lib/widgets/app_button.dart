import 'package:flutter/material.dart';

class AppButton extends StatelessWidget {

  //prop
  final String title;
  final VoidCallback onPressed;

  //contructor
  const AppButton({
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