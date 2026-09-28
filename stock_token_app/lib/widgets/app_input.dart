import 'package:flutter/material.dart';

class AppInput extends StatelessWidget {

  //prop
  final String title;
  final VoidCallback onPressed;
  
  //contructor
  const AppInput({
    super.key,
    required this.title,
    required this.onPressed,
  });

  //build
  @override
  Widget build(BuildContext context) {
    return TextField(
      decoration: InputDecoration(
        border: OutlineInputBorder(),
        hintText: title,
      ),
    );
  }
}