import 'package:flutter/material.dart';

class AppBadge extends StatelessWidget {
    final String text;
    final Color color;

    const AppBadge({
        super.key,
        required this.text,
        required this.color,
    });

    @override
    Widget build(BuildContext context) {
        return Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
                text,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                ),
            ),
        );
    }
}