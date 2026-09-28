import 'package:flutter/material.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final Gradient? gradient;
  final String? variant; // 'default', 'bordered'

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.gradient,
    this.variant
  });
  
  @override
  Widget build(BuildContext context) {
    return Container(
        padding: padding ?? const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: gradient,
          color: gradient == null ? Colors.white : null,
          borderRadius: BorderRadius.circular(16),
          border: variant == 'bordered'
            ? Border.all(color:Colors.grey.shade200)
            :null,
          boxShadow:[
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0,2),
            ),
          ],
        ),
    child: child
    );
  }
}
