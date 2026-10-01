//màn hình test widget

import 'package:flutter/material.dart';
import '../widgets/loading_spinner.dart';
import '../widgets/app_button.dart';
import '../widgets/app_card.dart';
import '../widgets/app_input.dart';
import '../widgets/app_modal.dart';

class PlaygroundScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('UI Components Library')),
      body: ListView(
        padding: EdgeInsets.all(16),
        children: [
          Text('1. Loading Spinner:'),
          LoadingSpinner(), // Xem spinner
          Divider(),

          Text('2. Nút bấm:'),
          AppButton(title: "Buy Token", onPressed: () {}), // Xem nút bấm
          Divider(),

          Text('3. AppCard:'),
          AppCard(
            child: Column(
              children: [
                Text('Card Content'),
                AppButton(title: "Buy Stock", onPressed: () {}),
              ],
            ),
          ), // Xem card
          Divider(),

          Text('4. AppTextInput:'),
          AppInput(title: 'Nhập số tiền muốn nạp', onPressed: () => {}),
          Divider(),

          Text('4.Modal'),
          AppModal(title: "Modal", onPressed: () => {}),
        ],
      ),
    );
  }
}
