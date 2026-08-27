import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novapay_flutter/main.dart';

void main() {
  testWidgets('App landing/login screen build test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that the login screen/gate is presented
    expect(find.text('NovaPay'), findsWidgets);
    expect(find.text('Email Address'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
  });
}
